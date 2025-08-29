const { Customer } = require('../entities/Customer');
const { ValidationError, NotFoundError } = require('../../shared/exceptions/AppError');

class CustomerService {
  constructor(customerRepository, auditService) {
    this.customerRepository = customerRepository;
    this.auditService = auditService;
  }

  async createCustomer(customerData) {
    // Check if customer with same email exists
    const existingCustomer = await this.customerRepository.findByEmail(customerData.email);
    if (existingCustomer) {
      throw new ValidationError('Customer with this email already exists');
    }

    // Check if tax number exists (for business customers)
    if (customerData.taxRegistrationNumber) {
      const existingTaxCustomer = await this.customerRepository.findByTaxNumber(customerData.taxRegistrationNumber);
      if (existingTaxCustomer) {
        throw new ValidationError('Customer with this tax registration number already exists');
      }
    }

    const customer = new Customer(customerData);

    // Validate customer data
    const validation = customer.validate();
    if (!validation.isValid) {
      throw new ValidationError('Customer validation failed', validation.errors);
    }

    return await this.customerRepository.save(customer);
  }

  async updateCustomer(id, updateData) {
    const existingCustomer = await this.customerRepository.findById(id);
    if (!existingCustomer) {
      throw new NotFoundError('Customer');
    }

    // Check email uniqueness if email is being updated
    if (updateData.email && updateData.email !== existingCustomer.email) {
      const emailExists = await this.customerRepository.findByEmail(updateData.email);
      if (emailExists) {
        throw new ValidationError('Customer with this email already exists');
      }
    }

    // Check tax number uniqueness if being updated
    if (updateData.taxRegistrationNumber && updateData.taxRegistrationNumber !== existingCustomer.taxRegistrationNumber) {
      const taxExists = await this.customerRepository.findByTaxNumber(updateData.taxRegistrationNumber);
      if (taxExists) {
        throw new ValidationError('Customer with this tax registration number already exists');
      }
    }

    const updatedCustomer = new Customer({
      ...existingCustomer,
      ...updateData,
      updatedAt: new Date()
    });

    const validation = updatedCustomer.validate();
    if (!validation.isValid) {
      throw new ValidationError('Customer validation failed', validation.errors);
    }

    return await this.customerRepository.save(updatedCustomer);
  }

  async getCustomerById(id) {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new NotFoundError('Customer');
    }
    return customer;
  }

  async getCustomers(filters = {}, pagination = {}) {
    return await this.customerRepository.findAll(filters, pagination);
  }

  async searchCustomers(query) {
    return await this.customerRepository.search(query);
  }

  async deleteCustomer(id) {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new NotFoundError('Customer');
    }

    // Soft delete - mark as inactive
    await this.customerRepository.delete(id);
  }

  async validateCustomerTaxNumber(taxNumber) {
    // Implement Oman tax number validation logic
    const cleanTaxNumber = taxNumber.replace(/\D/g, '');
    
    if (cleanTaxNumber.length !== 15) {
      return { isValid: false, error: 'Tax number must be 15 digits' };
    }

    // Check if exists in database
    const existingCustomer = await this.customerRepository.findByTaxNumber(taxNumber);
    
    return {
      isValid: true,
      exists: !!existingCustomer,
      customer: existingCustomer
    };
  }
}

module.exports = CustomerService;
