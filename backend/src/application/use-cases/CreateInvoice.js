class CreateInvoiceUseCase {
  constructor(invoiceRepository, customerRepository, taxService, auditService) {
    this.invoiceRepository = invoiceRepository;
    this.customerRepository = customerRepository;
    this.taxService = taxService;
    this.auditService = auditService;
  }

  async execute(invoiceData, userId) {
    // Validate customer exists
    const customer = await this.customerRepository.findById(invoiceData.customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    // Create invoice entity
    const invoice = new Invoice({
      ...invoiceData,
      createdBy: userId
    });

    // Validate invoice
    const validation = invoice.validate();
    if (!validation.isValid) {
      throw new ValidationError('Invoice validation failed', validation.errors);
    }

    // Calculate taxes
    await this.taxService.calculateTaxes(invoice);

    // Save invoice
    const savedInvoice = await this.invoiceRepository.save(invoice);

    // Log audit entry
    await this.auditService.logActivity({
      userId,
      entityType: 'Invoice',
      entityId: savedInvoice.id,
      action: 'create',
      newValues: savedInvoice
    });

    return savedInvoice;
  }
}

module.exports = CreateInvoiceUseCase;
