const { v4: uuidv4 } = require('uuid');

class UserRepository {
  async save(user) {
    throw new Error('Method must be implemented');
  }

  async findById(id) {
    throw new Error('Method must be implemented');
  }

  async findByEmail(email) {
    throw new Error('Method must be implemented');
  }

  async findByUsername(username) {
    throw new Error('Method must be implemented');
  }

  async findAll(filters = {}) {
    throw new Error('Method must be implemented');
  }

  async delete(id) {
    throw new Error('Method must be implemented');
  }

  async updateLastLogin(id) {
    throw new Error('Method must be implemented');
  }
}

module.exports = UserRepository;
