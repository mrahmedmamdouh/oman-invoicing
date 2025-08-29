class CustomerRepository {
  async save(customer) {
    throw new Error('Method must be implemented');
  }

  async findById(id) {
    throw new Error('Method must be implemented');
  }

  async findByEmail(email) {
    throw new Error('Method must be implemented');
  }

  async findByTaxNumber(taxNumber) {
    throw new Error('Method must be implemented');
  }

  async findAll(filters = {}, pagination = {}) {
    throw new Error('Method must be implemented');
  }

  async delete(id) {
    throw new Error('Method must be implemented');
  }

  async search(query) {
    throw new Error('Method must be implemented');
  }
}

module.exports = CustomerRepository;
