class UpdateInvoiceUseCase {
  constructor(invoiceRepository, taxService, auditService) {
    this.invoiceRepository = invoiceRepository;
    this.taxService = taxService;
    this.auditService = auditService;
  }

  async execute(invoiceId, updateData, userId) {
    const existingInvoice = await this.invoiceRepository.findById(invoiceId);
    if (!existingInvoice) {
      throw new Error('Invoice not found');
    }

    // Don't allow updates to finalized invoices
    if (['sent', 'paid'].includes(existingInvoice.status)) {
      throw new Error('Cannot update finalized invoice');
    }

    const oldValues = { ...existingInvoice };

    // Update invoice
    const updatedInvoice = new Invoice({ ...existingInvoice, ...updateData });
    
    // Recalculate taxes
    await this.taxService.calculateTaxes(updatedInvoice);
    
    updatedInvoice.updatedAt = new Date();

    const savedInvoice = await this.invoiceRepository.save(updatedInvoice);

    // Log audit entry
    await this.auditService.logActivity({
      userId,
      entityType: 'Invoice',
      entityId: savedInvoice.id,
      action: 'update',
      oldValues,
      newValues: savedInvoice
    });

    return savedInvoice;
  }
}

module.exports = UpdateInvoiceUseCase;
