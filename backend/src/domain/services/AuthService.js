const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { User } = require('../entities/User');

class AuthService {
  constructor(userRepository, redisClient) {
    this.userRepository = userRepository;
    this.redisClient = redisClient;
  }

  async login(email, password) {
    try {
      const user = await this.userRepository.findByEmail(email);
      
      if (!user || !user.isActive) {
        return { success: false, message: 'Invalid credentials' };
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      
      if (!isPasswordValid) {
        return { success: false, message: 'Invalid credentials' };
      }

      // Update last login
      await this.userRepository.updateLastLogin(user.id);

      // Generate tokens
      const tokens = await this.generateTokens(user);

      // Store refresh token in Redis (if available)
      if (this.redisClient) {
        try {
          await this.redisClient.setex(`refresh_token:${user.id}`, 7 * 24 * 60 * 60, tokens.refreshToken);
        } catch (redisError) {
          console.warn('Redis not available for refresh token storage:', redisError.message);
        }
      }

      return {
        success: true,
        user: this.sanitizeUser(user),
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed' };
    }
  }

  async register(userData) {
    try {
      // Check if user exists
      const existingUser = await this.userRepository.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('User already exists');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(userData.password, 12);

      // Create user
      const user = new User({
        ...userData,
        passwordHash,
        isActive: true
      });

      const savedUser = await this.userRepository.save(user);
      const tokens = await this.generateTokens(savedUser);

      return {
        success: true,
        user: this.sanitizeUser(savedUser),
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      
      // Check if refresh token exists in Redis (if available)
      if (this.redisClient) {
        try {
          const storedToken = await this.redisClient.get(`refresh_token:${decoded.userId}`);
          if (!storedToken || storedToken !== refreshToken) {
            return { success: false, message: 'Invalid refresh token' };
          }
        } catch (redisError) {
          console.warn('Redis not available for token verification:', redisError.message);
        }
      }

      const user = await this.userRepository.findById(decoded.userId);
      if (!user || !user.isActive) {
        return { success: false, message: 'User not found' };
      }

      const tokens = await this.generateTokens(user);
      
      // Update stored refresh token (if Redis available)
      if (this.redisClient) {
        try {
          await this.redisClient.setex(`refresh_token:${user.id}`, 7 * 24 * 60 * 60, tokens.refreshToken);
        } catch (redisError) {
          console.warn('Redis not available for token storage:', redisError.message);
        }
      }

      return {
        success: true,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken
      };
    } catch (error) {
      return { success: false, message: 'Invalid refresh token' };
    }
  }

  async logout(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      if (this.redisClient) {
        await this.redisClient.del(`refresh_token:${decoded.userId}`);
      }
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }

  async getUserById(id) {
    const user = await this.userRepository.findById(id);
    return user ? this.sanitizeUser(user) : null;
  }

  async updateProfile(id, updateData) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = new User({
      ...user,
      ...updateData,
      updatedAt: new Date()
    });

    const savedUser = await this.userRepository.save(updatedUser);
    return this.sanitizeUser(savedUser);
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isOldPasswordValid) {
      throw new Error('Invalid current password');
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    
    const updatedUser = new User({
      ...user,
      passwordHash: newPasswordHash,
      updatedAt: new Date()
    });

    await this.userRepository.save(updatedUser);
    
    // Invalidate all refresh tokens
    if (this.redisClient) {
      try {
        await this.redisClient.del(`refresh_token:${userId}`);
      } catch (redisError) {
        console.warn('Redis not available for token cleanup:', redisError.message);
      }
    }

    return { success: true };
  }

  async generateTokens(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
    );

    return { accessToken, refreshToken };
  }

  sanitizeUser(user) {
    // Remove sensitive data
    const { passwordHash, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}

module.exports = AuthService;