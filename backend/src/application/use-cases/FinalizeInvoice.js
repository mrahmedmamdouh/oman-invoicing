class FinalizeInvoiceUseCase {
  constructor(
    invoiceRepository, 
    customerRepository,
    digitalSignatureService,
    peppolService,
    taxService,
    auditService
  ) {
    this.invoiceRepository = invoiceRepository;
    this.customerRepository = customerRepository;
    this.digitalSignatureService = digitalSignatureService;
    this.peppolService = peppolService;
    this.taxService = taxService;
    this.auditService = auditService;
  }

  async execute(invoiceId, userId) {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.status !== 'draft') {
      throw new Error('Only draft invoices can be finalized');
    }

    const customer = await this.customerRepository.findById(invoice.customerId);

    try {
      // Generate digital signature
      const signature = await this.digitalSignatureService.signInvoice(invoice);
      invoice.digitalSignature = signature;

      // Submit to PEPPOL if customer has PEPPOL ID
      if (customer.peppolId) {
        const peppolResult = await this.peppolService.sendDocument({
          invoice,
          customer,
          senderId: invoice.taxRegistrationNumber,
          receiverId: customer.peppolId,
          documentType: 'Invoice'
        });
        invoice.peppolId = peppolResult.messageId;
      }

      // Submit to Oman Tax Authority
      await this.taxService.submitToOTA(invoice);

      // Update status
      invoice.status = 'sent';
      invoice.isFinalized = true;
      invoice.finalizedAt = new Date();
      invoice.updatedAt = new Date();

      const finalizedInvoice = await this.invoiceRepository.save(invoice);

      // Log audit entry
      await this.auditService.logActivity({
        userId,
        entityType: 'Invoice',
        entityId: finalizedInvoice.id,
        action: 'finalize',
        newValues: { status: 'sent', finalizedAt: new Date() }
      });

      return finalizedInvoice;
    } catch (error) {
      // Log failed finalization attempt
      await this.auditService.logActivity({
        userId,
        entityType: 'Invoice',
        entityId: invoice.id,
        action: 'finalize_failed',
        error: error.message
      });

      throw error;
    }
  }
}

module.exports = FinalizeInvoiceUseCase;
