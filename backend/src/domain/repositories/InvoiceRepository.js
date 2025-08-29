class InvoiceRepository {
  async save(invoice) {
    throw new Error('Method must be implemented');
  }

  async findById(id) {
    throw new Error('Method must be implemented');
  }

  async findByInvoiceNumber(invoiceNumber) {
    throw new Error('Method must be implemented');
  }

  async findByCustomer(customerId, pagination = {}) {
    throw new Error('Method must be implemented');
  }

  async findByDateRange(startDate, endDate) {
    throw new Error('Method must be implemented');
  }

  async findOverdue(currentDate) {
    throw new Error('Method must be implemented');
  }

  async getStatistics(dateRange = {}) {
    throw new Error('Method must be implemented');
  }

  async delete(id) {
    throw new Error('Method must be implemented');
  }

  async findAll(filters = {}, pagination = {}) {
    throw new Error('Method must be implemented');
  }
}

module.exports = InvoiceRepository;

