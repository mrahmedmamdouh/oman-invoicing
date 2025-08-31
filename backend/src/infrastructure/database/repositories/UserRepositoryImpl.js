const UserRepository = require('../../../domain/repositories/UserRepository');
const { User } = require('../../../domain/entities/User');
const { db } = require('../../../config/database');

class UserRepositoryImpl extends UserRepository {
  async save(user) {
    if (user.id && await this.findById(user.id)) {
      // Update existing user
      await db('users')
        .where('id', user.id)
        .update({
          username: user.username,
          email: user.email,
          password_hash: user.passwordHash,
          full_name: user.fullName,
          full_name_ar: user.fullNameAr,
          role: user.role,
          is_active: user.isActive,
          tax_registration_number: user.taxRegistrationNumber,
          commercial_registration_number: user.commercialRegistrationNumber,
          language: user.language,
          last_login_at: user.lastLoginAt,
          updated_at: new Date()
        });
    } else {
      // Insert new user
      await db('users').insert({
        id: user.id,
        username: user.username,
        email: user.email,
        password_hash: user.passwordHash,
        full_name: user.fullName,
        full_name_ar: user.fullNameAr,
        role: user.role,
        is_active: user.isActive,
        tax_registration_number: user.taxRegistrationNumber,
        commercial_registration_number: user.commercialRegistrationNumber,
        language: user.language,
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    return await this.findById(user.id);
  }

  async findById(id) {
    const userData = await db('users').where('id', id).first();
    return userData ? this.mapToEntity(userData) : null;
  }

  async findByEmail(email) {
    const userData = await db('users').where('email', email).first();
    return userData ? this.mapToEntity(userData) : null;
  }

  async findByUsername(username) {
    const userData = await db('users').where('username', username).first();
    return userData ? this.mapToEntity(userData) : null;
  }

  async findAll(filters = {}) {
    let query = db('users');

    if (filters.isActive !== undefined) {
      query = query.where('is_active', filters.isActive);
    }

    if (filters.role) {
      query = query.where('role', filters.role);
    }

    const users = await query.orderBy('created_at', 'desc');
    return users.map(user => this.mapToEntity(user));
  }

  async delete(id) {
    await db('users').where('id', id).update({ 
      is_active: false, 
      updated_at: new Date() 
    });
  }

  async updateLastLogin(id) {
    await db('users')
      .where('id', id)
      .update({ last_login_at: new Date() });
  }

  mapToEntity(userData) {
    return new User({
      id: userData.id,
      username: userData.username,
      email: userData.email,
      passwordHash: userData.password_hash,
      fullName: userData.full_name,
      fullNameAr: userData.full_name_ar,
      role: userData.role,
      isActive: userData.is_active,
      taxRegistrationNumber: userData.tax_registration_number,
      commercialRegistrationNumber: userData.commercial_registration_number,
      language: userData.language,
      lastLoginAt: userData.last_login_at,
      createdAt: userData.created_at,
      updatedAt: userData.updated_at
    });
  }
}

module.exports = UserRepositoryImpl;