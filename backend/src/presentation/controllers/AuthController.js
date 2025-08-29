const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { AuthService } = require('../../domain/services/AuthService');
const logger = require('../../shared/utils/logger');

class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  async login(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          errors: errors.array(),
          message_ar: 'فشل في التحقق من البيانات'
        });
      }

      const { email, password } = req.body;

      const result = await this.authService.login(email, password);

      if (!result.success) {
        return res.status(401).json({
          error: 'Invalid credentials',
          message_ar: 'بيانات الدخول غير صحيحة'
        });
      }

      logger.info(`User logged in: ${email} from IP ${req.ip}`);

      res.json({
        success: true,
        data: {
          user: result.user,
          token: result.token,
          refreshToken: result.refreshToken
        },
        message: 'Login successful',
        message_ar: 'تم تسجيل الدخول بنجاح'
      });
    } catch (error) {
      next(error);
    }
  }

  async register(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          errors: errors.array(),
          message_ar: 'فشل في التحقق من البيانات'
        });
      }

      const userData = req.body;
      const result = await this.authService.register(userData);

      logger.info(`New user registered: ${userData.email}`);

      res.status(201).json({
        success: true,
        data: {
          user: result.user,
          token: result.token,
          refreshToken: result.refreshToken
        },
        message: 'Registration successful',
        message_ar: 'تم إنشاء الحساب بنجاح'
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          error: 'Refresh token is required',
          message_ar: 'رمز التحديث مطلوب'
        });
      }

      const result = await this.authService.refreshToken(refreshToken);

      if (!result.success) {
        return res.status(401).json({
          error: 'Invalid refresh token',
          message_ar: 'رمز التحديث غير صالح'
        });
      }

      res.json({
        success: true,
        data: {
          token: result.token,
          refreshToken: result.refreshToken
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      await this.authService.logout(refreshToken);

      logger.info(`User logged out: ${req.user.email}`);

      res.json({
        success: true,
        message: 'Logout successful',
        message_ar: 'تم تسجيل الخروج بنجاح'
      });
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req, res, next) {
    try {
      const user = await this.authService.getUserById(req.user.id);

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          errors: errors.array(),
          message_ar: 'فشل في التحقق من البيانات'
        });
      }

      const updateData = req.body;
      const user = await this.authService.updateProfile(req.user.id, updateData);

      logger.info(`Profile updated: ${req.user.email}`);

      res.json({
        success: true,
        data: user,
        message: 'Profile updated successfully',
        message_ar: 'تم تحديث الملف الشخصي بنجاح'
      });
    } catch (error) {
      next(error);
    }
  }
}
