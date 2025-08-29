const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const momentHijri = require('moment-hijri');

class Invoice {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.invoiceNumber = data.invoiceNumber || this.generateInvoiceNumber();
    this.customerId = data.customerId;
    this.issueDate = data.issueDate || new Date();
    this.dueDate = data.dueDate;
    this.status = data.status || 'draft'; // draft, sent, paid, overdue, cancelled
    this.currency = data.currency || 'OMR';
    this.exchangeRate = data.exchangeRate || 1.0;
    
    // Line items
    this.items = data.items || [];
    
    // Tax calculations
    this.subtotal = data.subtotal || 0;
    this.vatAmount = data.vatAmount || 0;
    this.vatRate = data.vatRate || 0.05; // 5% VAT in Oman
    this.corporateTaxAmount = data.corporateTaxAmount || 0;
    this.corporateTaxRate = data.corporateTaxRate || 0.15; // 15% Corporate Tax
    this.totalAmount = data.totalAmount || 0;
    
    // Oman specific fields
    this.taxRegistrationNumber = data.taxRegistrationNumber;
    this.commercialRegistrationNumber = data.commercialRegistrationNumber;
    this.qrCode = data.qrCode;
    this.digitalSignature = data.digitalSignature;
    this.peppolId = data.peppolId;
    
    // Hijri date support
    this.issueDateHijri = data.issueDateHijri || this.toHijri(this.issueDate);
    this.dueDateHijri = data.dueDateHijri || (this.dueDate ? this.toHijri(this.dueDate) : null);
    
    // Metadata
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.createdBy = data.createdBy;
    
    // Storage compliance (10-year requirement)
    this.retentionUntil = data.retentionUntil || this.calculateRetentionDate();
  }

  generateInvoiceNumber() {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    return `INV-${year}-${timestamp}`;
  }

  toHijri(date) {
    return momentHijri(date).format('iYYYY/iM/iD');
  }

  calculateRetentionDate() {
    return moment(this.issueDate).add(10, 'years').toDate();
  }

  addItem(item) {
    const invoiceItem = new InvoiceItem({
      ...item,
      invoiceId: this.id
    });
    this.items.push(invoiceItem);
    this.recalculateTotals();
  }

  recalculateTotals() {
    this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
    this.vatAmount = this.subtotal * this.vatRate;
    this.corporateTaxAmount = this.subtotal * this.corporateTaxRate;
    this.totalAmount = this.subtotal + this.vatAmount + this.corporateTaxAmount;
  }

  validate() {
    const errors = [];

    if (!this.customerId) {
      errors.push('Customer ID is required');
    }

    if (!this.taxRegistrationNumber) {
      errors.push('Tax Registration Number is required for Oman compliance');
    }

    if (!this.commercialRegistrationNumber) {
      errors.push('Commercial Registration Number is required');
    }

    if (this.items.length === 0) {
      errors.push('At least one invoice item is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  toJSON() {
    return {
      id: this.id,
      invoiceNumber: this.invoiceNumber,
      customerId: this.customerId,
      issueDate: this.issueDate,
      issueDateHijri: this.issueDateHijri,
      dueDate: this.dueDate,
      dueDateHijri: this.dueDateHijri,
      status: this.status,
      currency: this.currency,
      items: this.items,
      subtotal: this.subtotal,
      vatAmount: this.vatAmount,
      vatRate: this.vatRate,
      corporateTaxAmount: this.corporateTaxAmount,
      corporateTaxRate: this.corporateTaxRate,
      totalAmount: this.totalAmount,
      taxRegistrationNumber: this.taxRegistrationNumber,
      commercialRegistrationNumber: this.commercialRegistrationNumber,
      qrCode: this.qrCode,
      digitalSignature: this.digitalSignature,
      peppolId: this.peppolId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

class InvoiceItem {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.invoiceId = data.invoiceId;
    this.description = data.description;
    this.descriptionAr = data.descriptionAr; // Arabic description
    this.quantity = data.quantity || 1;
    this.unitPrice = data.unitPrice || 0;
    this.total = data.total || (this.quantity * this.unitPrice);
    this.taxable = data.taxable !== false; // Default to taxable
    this.vatRate = data.vatRate || 0.05;
    this.productCode = data.productCode;
    this.unit = data.unit || 'piece'; // pieces, kg, liters, etc.
  }

  recalculateTotal() {
    this.total = this.quantity * this.unitPrice;
  }
}
