const { validationResult } = require('express-validator');
const { InvoiceService } = require('../../domain/services/InvoiceService');
const { createInvoiceValidator, updateInvoiceValidator } = require('../validators/invoiceValidators');
const logger = require('../../shared/utils/logger');

class InvoiceController {
  constructor(invoiceService) {
    this.invoiceService = invoiceService;
  }

  async createInvoice(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          errors: errors.array(),
          message_ar: 'فشل في التحقق من البيانات'
        });
      }

      const invoiceData = {
        ...req.body,
        createdBy: req.user.id,
        taxRegistrationNumber: req.user.taxRegistrationNumber,
        commercialRegistrationNumber: req.user.commercialRegistrationNumber
      };

      const invoice = await this.invoiceService.createInvoice(invoiceData);

      logger.info(`Invoice created: ${invoice.invoiceNumber} by user ${req.user.id}`);

      res.status(201).json({
        success: true,
        data: invoice,
        message: 'Invoice created successfully',
        message_ar: 'تم إنشاء الفاتورة بنجاح'
      });
    } catch (error) {
      next(error);
    }
  }

  async getInvoices(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        customerId,
        dateFrom,
        dateTo,
        search
      } = req.query;

      const filters = {
        status,
        customerId,
        dateFrom,
        dateTo,
        search,
        createdBy: req.user.role !== 'admin' ? req.user.id : undefined
      };

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit)
      };

      const result = await this.invoiceService.getInvoices(filters, pagination);

      res.json({
        success: true,
        data: result.invoices,
        pagination: result.pagination,
        statistics: result.statistics
      });
    } catch (error) {
      next(error);
    }
  }

  async getInvoiceById(req, res, next) {
    try {
      const { id } = req.params;
      const invoice = await this.invoiceService.getInvoiceById(id);

      if (!invoice) {
        return res.status(404).json({
          error: 'Invoice not found',
          message_ar: 'الفاتورة غير موجودة'
        });
      }

      // Check ownership (non-admin users can only see their own invoices)
      if (req.user.role !== 'admin' && invoice.createdBy !== req.user.id) {
        return res.status(403).json({
          error: 'Access denied',
          message_ar: 'غير مصرح بالوصول'
        });
      }

      res.json({
        success: true,
        data: invoice
      });
    } catch (error) {
      next(error);
    }
  }

  async updateInvoice(req, res, next) {
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
      const updateData = req.body;

      const invoice = await this.invoiceService.updateInvoice(id, updateData);

      logger.info(`Invoice updated: ${invoice.invoiceNumber} by user ${req.user.id}`);

      res.json({
        success: true,
        data: invoice,
        message: 'Invoice updated successfully',
        message_ar: 'تم تحديث الفاتورة بنجاح'
      });
    } catch (error) {
      next(error);
    }
  }

  async finalizeInvoice(req, res, next) {
    try {
      const { id } = req.params;
      const invoice = await this.invoiceService.finalizeInvoice(id);

      logger.info(`Invoice finalized: ${invoice.invoiceNumber} by user ${req.user.id}`);

      res.json({
        success: true,
        data: invoice,
        message: 'Invoice finalized successfully',
        message_ar: 'تم اعتماد الفاتورة بنجاح'
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteInvoice(req, res, next) {
    try {
      const { id } = req.params;
      await this.invoiceService.deleteInvoice(id);

      logger.info(`Invoice deleted: ${id} by user ${req.user.id}`);

      res.json({
        success: true,
        message: 'Invoice deleted successfully',
        message_ar: 'تم حذف الفاتورة بنجاح'
      });
    } catch (error) {
      next(error);
    }
  }

  async downloadInvoice(req, res, next) {
    try {
      const { id } = req.params;
      const { format = 'pdf' } = req.query;

      const invoice = await this.invoiceService.getInvoiceById(id);
      if (!invoice) {
        return res.status(404).json({
          error: 'Invoice not found',
          message_ar: 'الفاتورة غير موجودة'
        });
      }

      const buffer = await this.invoiceService.generateInvoiceDocument(invoice, format);
      const filename = `invoice-${invoice.invoiceNumber}.${format}`;

      res.set({
        'Content-Type': format === 'pdf' ? 'application/pdf' : 'text/xml',
        'Content-Disposition': `attachment; filename="${filename}"`
      });

      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  async getInvoiceStatistics(req, res, next) {
    try {
      const { dateFrom, dateTo } = req.query;
      const dateRange = { dateFrom, dateTo };

      const statistics = await this.invoiceService.getInvoiceStatistics(dateRange);

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      next(error);
    }
  }
}
