const express = require('express');
const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');
const { requireRole } = require('../middleware/role');
const rateLimitMiddleware = require('../middleware/rateLimit');
const logger = require('../../shared/utils/logger');

// Import services (these would be injected via DI container in production)
const PeppolService = require('../../domain/services/PeppolService');
const InvoiceRepositoryImpl = require('../../infrastructure/database/repositories/InvoiceRepositoryImpl');
const CustomerRepositoryImpl = require('../../infrastructure/database/repositories/CustomerRepositoryImpl');
const PeppolGateway = require('../../infrastructure/external/PeppolGateway');

const router = express.Router();

// Initialize services
const peppolGateway = new PeppolGateway();
const peppolService = new PeppolService(peppolGateway);
const invoiceRepository = new InvoiceRepositoryImpl();
const customerRepository = new CustomerRepositoryImpl();

// Submit invoice to PEPPOL network
router.post('/submit/:invoiceId',
  rateLimitMiddleware.standardLimit,
  requireRole(['admin', 'manager', 'accountant']),
  param('invoiceId').isUUID().withMessage('Valid invoice ID is required'),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { invoiceId } = req.params;

      // Get invoice details
      const invoice = await invoiceRepository.findById(invoiceId);
      if (!invoice) {
        return res.status(404).json({
          error: 'Invoice not found',
          message_ar: 'الفاتورة غير موجودة'
        });
      }

      // Get customer details
      const customer = await customerRepository.findById(invoice.customerId);
      if (!customer) {
        return res.status(404).json({
          error: 'Customer not found',
          message_ar: 'العميل غير موجود'
        });
      }

      // Check if customer has PEPPOL ID
      if (!customer.peppolId) {
        return res.status(400).json({
          error: 'Customer does not have PEPPOL ID',
          message_ar: 'العميل لا يملك معرف PEPPOL'
        });
      }

      // Check invoice status
      if (invoice.status === 'draft') {
        return res.status(400).json({
          error: 'Cannot submit draft invoice to PEPPOL',
          message_ar: 'لا يمكن إرسال مسودة الفاتورة إلى PEPPOL'
        });
      }

      // Submit to PEPPOL
      const result = await peppolService.submitInvoice(invoice, customer);

      // Update invoice with PEPPOL ID
      invoice.peppolId = result.messageId;
      await invoiceRepository.save(invoice);

      logger.info('Invoice submitted to PEPPOL', {
        invoiceId: invoice.id,
        peppolMessageId: result.messageId,
        userId: req.user.id
      });

      res.json({
        success: true,
        data: {
          messageId: result.messageId,
          status: result.status,
          timestamp: result.timestamp
        },
        message: 'Invoice submitted to PEPPOL network successfully',
        message_ar: 'تم إرسال الفاتورة إلى شبكة PEPPOL بنجاح'
      });
    } catch (error) {
      logger.error('PEPPOL submission failed', {
        invoiceId: req.params.invoiceId,
        error: error.message,
        userId: req.user.id
      });
      next(error);
    }
  }
);

// Get PEPPOL delivery status
router.get('/status/:messageId',
  rateLimitMiddleware.standardLimit,
  param('messageId').notEmpty().withMessage('Message ID is required'),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { messageId } = req.params;

      const status = await peppolService.getDeliveryStatus(messageId);

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      logger.error('Failed to get PEPPOL status', {
        messageId: req.params.messageId,
        error: error.message
      });
      next(error);
    }
  }
);

// Validate PEPPOL participant ID
router.post('/validate-participant',
  rateLimitMiddleware.standardLimit,
  body('participantId').notEmpty().withMessage('Participant ID is required'),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { participantId } = req.body;

      const validation = await peppolService.validatePeppolId(participantId);

      res.json({
        success: true,
        data: validation
      });
    } catch (error) {
      logger.error('PEPPOL participant validation failed', {
        participantId: req.body.participantId,
        error: error.message
      });
      next(error);
    }
  }
);

// Get PEPPOL configuration
router.get('/config',
  rateLimitMiddleware.standardLimit,
  requireRole(['admin', 'manager']),
  async (req, res, next) => {
    try {
      const config = {
        participantId: process.env.PEPPOL_PARTICIPANT_ID,
        gatewayUrl: process.env.PEPPOL_GATEWAY_URL ? 'Configured' : 'Not configured',
        certificateStatus: process.env.PEPPOL_CERTIFICATE_PATH ? 'Available' : 'Missing',
        supportedDocuments: ['Invoice', 'CreditNote'],
        ublVersion: '2.1'
      };

      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      next(error);
    }
  }
);

// Test PEPPOL connection
router.post('/test-connection',
  rateLimitMiddleware.standardLimit,
  requireRole(['admin']),
  async (req, res, next) => {
    try {
      // Test connection to PEPPOL gateway
      const testResult = await peppolGateway.testConnection();

      res.json({
        success: true,
        data: testResult,
        message: 'PEPPOL connection test completed',
        message_ar: 'تم اختبار الاتصال بشبكة PEPPOL'
      });
    } catch (error) {
      logger.error('PEPPOL connection test failed', {
        error: error.message,
        userId: req.user.id
      });
      
      res.status(500).json({
        success: false,
        error: 'PEPPOL connection test failed',
        message_ar: 'فشل في اختبار الاتصال بشبكة PEPPOL',
        details: error.message
      });
    }
  }
);

module.exports = router;
