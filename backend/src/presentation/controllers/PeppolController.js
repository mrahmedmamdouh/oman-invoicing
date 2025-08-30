const logger = require('../../shared/utils/logger');

class PeppolController {
  constructor(peppolService, invoiceRepository, customerRepository) {
    this.peppolService = peppolService;
    this.invoiceRepository = invoiceRepository;
    this.customerRepository = customerRepository;
  }

  async submitInvoice(req, res, next) {
    try {
      const { invoiceId } = req.params;
      const options = req.body;

      // Get invoice and customer
      const invoice = await this.invoiceRepository.findById(invoiceId);
      if (!invoice) {
        return res.status(404).json({
          error: 'Invoice not found',
          message_ar: 'الفاتورة غير موجودة'
        });
      }

      const customer = await this.customerRepository.findById(invoice.customerId);
      if (!customer || !customer.peppolId) {
        return res.status(400).json({
          error: 'Customer does not have PEPPOL ID',
          message_ar: 'العميل لا يملك معرف PEPPOL'
        });
      }

      if (invoice.status === 'draft') {
        return res.status(400).json({
          error: 'Cannot submit draft invoice',
          message_ar: 'لا يمكن إرسال مسودة الفاتورة'
        });
      }

      // Submit to PEPPOL
      const result = await this.peppolService.submitInvoice(invoice, customer);

      // Update invoice
      invoice.peppolId = result.messageId;
      await this.invoiceRepository.save(invoice);

      logger.info('Invoice submitted to PEPPOL', {
        invoiceId,
        messageId: result.messageId,
        userId: req.user.id
      });

      res.json({
        success: true,
        data: result,
        message: 'Invoice submitted to PEPPOL successfully',
        message_ar: 'تم إرسال الفاتورة إلى شبكة PEPPOL بنجاح'
      });
    } catch (error) {
      logger.error('PEPPOL submission failed', {
        invoiceId: req.params.invoiceId,
        error: error.message,
        userId: req.user?.id
      });
      next(error);
    }
  }

  async getMessageStatus(req, res, next) {
    try {
      const { messageId } = req.params;
      const status = await this.peppolService.getDeliveryStatus(messageId);

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      next(error);
    }
  }

  async validateParticipant(req, res, next) {
    try {
      const { participantId } = req.body;
      const validation = await this.peppolService.validatePeppolId(participantId);

      res.json({
        success: true,
        data: validation
      });
    } catch (error) {
      next(error);
    }
  }

  async getConfiguration(req, res, next) {
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

  async testConnection(req, res, next) {
    try {
      const testResult = await this.peppolService.testConnection();

      res.json({
        success: true,
        data: testResult,
        message: 'PEPPOL connection test completed',
        message_ar: 'تم اختبار الاتصال بشبكة PEPPOL'
      });
    } catch (error) {
      logger.error('PEPPOL connection test failed', {
        error: error.message,
        userId: req.user?.id
      });

      res.status(500).json({
        success: false,
        error: 'PEPPOL connection test failed',
        message_ar: 'فشل في اختبار الاتصال بشبكة PEPPOL',
        details: error.message
      });
    }
  }
}

module.exports = PeppolController;
