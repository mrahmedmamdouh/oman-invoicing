class UserDTO {
  constructor(user) {
    this.id = user.id;
    this.username = user.username;
    this.email = user.email;
    this.fullName = user.fullName;
    this.fullNameAr = user.fullNameAr;
    this.role = user.role;
    this.isActive = user.isActive;
    this.taxRegistrationNumber = user.taxRegistrationNumber;
    this.commercialRegistrationNumber = user.commercialRegistrationNumber;
    this.language = user.language;
    this.permissions = user.permissions;
    this.lastLoginAt = user.lastLoginAt;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
    
    // Don't include sensitive data
    // this.passwordHash = user.passwordHash; // NEVER include password hash
  }

  static fromEntity(user) {
    return new UserDTO(user);
  }

  static fromEntities(users) {
    return users.map(user => new UserDTO(user));
  }

  // Method to get user for JWT token
  toTokenPayload() {
    return {
      userId: this.id,
      email: this.email,
      role: this.role,
      permissions: this.permissions
    };
  }

  // Method to get public user info
  toPublicInfo() {
    return {
      id: this.id,
      fullName: this.fullName,
      fullNameAr: this.fullNameAr,
      role: this.role,
      language: this.language
    };
  }
}

module.exports = UserDTO;
