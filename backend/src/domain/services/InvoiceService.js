const QRCode = require('qrcode');
const { Invoice } = require('../entities/Invoice');
const TaxService = require('./TaxService');
const PeppolService = require('./PeppolService');
const DigitalSignatureService = require('./DigitalSignatureService');

class InvoiceService {
  constructor(invoiceRepository, customerRepository, taxService, peppolService) {
    this.invoiceRepository = invoiceRepository;
    this.customerRepository = customerRepository;
    this.taxService = taxService;
    this.peppolService = peppolService;
  }

  async createInvoice(invoiceData) {
    const invoice = new Invoice(invoiceData);
    
    // Validate invoice
    const validation = invoice.validate();
    if (!validation.isValid) {
      throw new Error(`Invoice validation failed: ${validation.errors.join(', ')}`);
    }

    // Verify customer exists
    const customer = await this.customerRepository.findById(invoice.customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    // Apply tax calculations
    await this.taxService.calculateTaxes(invoice);

    // Generate QR code
    invoice.qrCode = await this.generateQRCode(invoice);

    // Save invoice
    const savedInvoice = await this.invoiceRepository.save(invoice);

    return savedInvoice;
  }

  async updateInvoice(id, updateData) {
    const existingInvoice = await this.invoiceRepository.findById(id);
    if (!existingInvoice) {
      throw new Error('Invoice not found');
    }

    // Don't allow updates to finalized invoices
    if (['sent', 'paid'].includes(existingInvoice.status)) {
      throw new Error('Cannot update finalized invoice');
    }

    const updatedInvoice = new Invoice({ ...existingInvoice, ...updateData });
    await this.taxService.calculateTaxes(updatedInvoice);
    updatedInvoice.qrCode = await this.generateQRCode(updatedInvoice);
    updatedInvoice.updatedAt = new Date();

    return await this.invoiceRepository.save(updatedInvoice);
  }

  async finalizeInvoice(id) {
    const invoice = await this.invoiceRepository.findById(id);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.status !== 'draft') {
      throw new Error('Only draft invoices can be finalized');
    }

    // Generate digital signature
    const signature = await DigitalSignatureService.signInvoice(invoice);
    invoice.digitalSignature = signature;

    // Submit to PEPPOL if customer has PEPPOL ID
    const customer = await this.customerRepository.findById(invoice.customerId);
    if (customer.peppolId) {
      invoice.peppolId = await this.peppolService.submitInvoice(invoice, customer);
    }

    // Submit to Oman Tax Authority
    await this.taxService.submitToOTA(invoice);

    invoice.status = 'sent';
    invoice.updatedAt = new Date();

    return await this.invoiceRepository.save(invoice);
  }

  async generateQRCode(invoice) {
    const qrData = {
      invoiceNumber: invoice.invoiceNumber,
      issueDate: invoice.issueDate.toISOString(),
      totalAmount: invoice.totalAmount,
      currency: invoice.currency,
      vatAmount: invoice.vatAmount,
      trn: invoice.taxRegistrationNumber
    };

    return await QRCode.toDataURL(JSON.stringify(qrData));
  }

  async getInvoicesByCustomer(customerId, pagination = {}) {
    return await this.invoiceRepository.findByCustomer(customerId, pagination);
  }

  async getOverdueInvoices() {
    const currentDate = new Date();
    return await this.invoiceRepository.findOverdue(currentDate);
  }

  async getInvoiceStatistics(dateRange = {}) {
    return await this.invoiceRepository.getStatistics(dateRange);
  }
}
