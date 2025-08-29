const { validationResult } = require('express-validator');
const logger = require('../../shared/utils/logger');

class CustomerController {
  constructor(customerService) {
    this.customerService = customerService;
  }

  async createCustomer(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          errors: errors.array(),
          message_ar: 'فشل في التحقق من البيانات'
        });
      }

      const customer = await this.customerService.createCustomer(req.body);

      logger.info(`Customer created: ${customer.name} by user ${req.user.id}`);

      res.status(201).json({
        success: true,
        data: customer,
        message: 'Customer created successfully',
        message_ar: 'تم إنشاء العميل بنجاح'
      });
    } catch (error) {
      next(error);
    }
  }

  async getCustomers(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        customerType,
        isActive = true
      } = req.query;

      const filters = { search, customerType, isActive: isActive === 'true' };
      const pagination = { page: parseInt(page), limit: parseInt(limit) };

      const result = await this.customerService.getCustomers(filters, pagination);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  async getCustomerById(req, res, next) {
    try {
      const { id } = req.params;
      const customer = await this.customerService.getCustomerById(id);

      if (!customer) {
        return res.status(404).json({
          error: 'Customer not found',
          message_ar: 'العميل غير موجود'
        });
      }

      res.json({
        success: true,
        data: customer
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCustomer(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          errors: errors.array(),
          message_ar: 'فشل في التحقق من البيانات'
        });
      }

      const { id } = req.params;
      const customer = await this.customerService.updateCustomer(id, req.body);

      logger.info(`Customer updated: ${customer.name} by user ${req.user.id}`);

      res.json({
        success: true,
        data: customer,
        message: 'Customer updated successfully',
        message_ar: 'تم تحديث العميل بنجاح'
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCustomer(req, res, next) {
    try {
      const { id } = req.params;
      await this.customerService.deleteCustomer(id);

      logger.info(`Customer deleted: ${id} by user ${req.user.id}`);

      res.json({
        success: true,
        message: 'Customer deleted successfully',
        message_ar: 'تم حذف العميل بنجاح'
      });
    } catch (error) {
      next(error);
    }
  }

  async searchCustomers(req, res, next) {
    try {
      const { query } = req.query;

      if (!query || query.length < 2) {
        return res.json({
          success: true,
          data: []
        });
      }

      const customers = await this.customerService.searchCustomers(query);

      res.json({
        success: true,
        data: customers
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CustomerController;
