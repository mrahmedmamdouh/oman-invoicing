class InvoiceDTO {
  constructor(invoice) {
    this.id = invoice.id;
    this.invoiceNumber = invoice.invoiceNumber;
    this.customerId = invoice.customerId;
    this.customer = invoice.customer ? {
      id: invoice.customer.id,
      name: invoice.customer.name,
      nameAr: invoice.customer.nameAr,
      email: invoice.customer.email,
      phone: invoice.customer.phone,
      taxRegistrationNumber: invoice.customer.taxRegistrationNumber
    } : null;
    
    this.issueDate = invoice.issueDate;
    this.issueDateHijri = invoice.issueDateHijri;
    this.dueDate = invoice.dueDate;
    this.dueDateHijri = invoice.dueDateHijri;
    this.status = invoice.status;
    this.currency = invoice.currency;
    
    this.items = invoice.items?.map(item => ({
      id: item.id,
      description: item.description,
      descriptionAr: item.descriptionAr,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total,
      taxable: item.taxable,
      unit: item.unit,
      productCode: item.productCode
    })) || [];
    
    this.subtotal = invoice.subtotal;
    this.vatAmount = invoice.vatAmount;
    this.vatRate = invoice.vatRate;
    this.corporateTaxAmount = invoice.corporateTaxAmount;
    this.totalAmount = invoice.totalAmount;
    
    this.taxRegistrationNumber = invoice.taxRegistrationNumber;
    this.commercialRegistrationNumber = invoice.commercialRegistrationNumber;
    this.qrCode = invoice.qrCode;
    this.peppolId = invoice.peppolId;
    
    this.digitalSignature = invoice.digitalSignature ? {
      signatureValue: invoice.digitalSignature.signatureValue,
      certificateId: invoice.digitalSignature.certificateId,
      timestamp: invoice.digitalSignature.timestamp,
      isValid: invoice.digitalSignature.isValid
    } : null;
    
    this.createdAt = invoice.createdAt;
    this.updatedAt = invoice.updatedAt;
    this.createdBy = invoice.createdBy;
  }

  static fromEntity(invoice) {
    return new InvoiceDTO(invoice);
  }

  static fromEntities(invoices) {
    return invoices.map(invoice => new InvoiceDTO(invoice));
  }
}

module.exports = InvoiceDTO;
