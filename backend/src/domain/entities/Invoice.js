const { v4: uuidv4 } = require('uuid');

class InvoiceItem {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.description = data.description;
    this.descriptionAr = data.descriptionAr;
    this.quantity = parseFloat(data.quantity) || 1;
    this.unitPrice = parseFloat(data.unitPrice) || 0;
    this.total = this.quantity * this.unitPrice;
    this.taxable = data.taxable !== false;
    this.vatRate = parseFloat(data.vatRate) || 0.05;
    this.unit = data.unit || 'piece';
    this.productCode = data.productCode;
    this.sortOrder = data.sortOrder || 0;
  }
}

class Invoice {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.invoiceNumber = data.invoiceNumber || this.generateInvoiceNumber();
    this.customerId = data.customerId;
    this.customer = data.customer;
    
    // Dates
    this.issueDate = data.issueDate || new Date();
    this.issueDateHijri = data.issueDateHijri || this.calculateHijriDate(this.issueDate);
    this.dueDate = data.dueDate || this.calculateDueDate();
    this.dueDateHijri = data.dueDateHijri || this.calculateHijriDate(this.dueDate);
    
    this.status = data.status || 'draft';
    this.currency = data.currency || 'OMR';
    this.exchangeRate = parseFloat(data.exchangeRate) || 1.0;
    
    // Items
    this.items = (data.items || []).map(item => new InvoiceItem(item));
    
    // Calculate amounts
    this.recalculateTotals();
    
    // Tax information
    this.taxRegistrationNumber = data.taxRegistrationNumber;
    this.commercialRegistrationNumber = data.commercialRegistrationNumber;
    
    // Compliance
    this.qrCode = data.qrCode;
    this.digitalSignature = data.digitalSignature;
    this.peppolId = data.peppolId;
    this.retentionUntil = data.retentionUntil || this.calculateRetentionDate();
    this.isFinalized = data.isFinalized || false;
    this.finalizedAt = data.finalizedAt;
    
    this.createdBy = data.createdBy;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  generateInvoiceNumber() {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    return `INV-${year}-${timestamp}`;
  }

  calculateHijriDate(gregorianDate) {
    // Simplified - in real implementation, use proper Hijri conversion
    const hijriYear = gregorianDate.getFullYear() - 579;
    return `${hijriYear}/${gregorianDate.getMonth() + 1}/${gregorianDate.getDate()}`;
  }

  calculateDueDate() {
    const dueDate = new Date(this.issueDate);
    dueDate.setDate(dueDate.getDate() + 30); // Default 30 days
    return dueDate;
  }

  calculateRetentionDate() {
    const retentionDate = new Date(this.issueDate);
    retentionDate.setFullYear(retentionDate.getFullYear() + 10); // 10 years retention
    return retentionDate;
  }

  recalculateTotals() {
    this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
    this.vatAmount = this.items
      .filter(item => item.taxable)
      .reduce((sum, item) => sum + (item.total * item.vatRate), 0);
    this.corporateTaxAmount = this.subtotal * 0.15; // 15% corporate tax if applicable
    this.totalAmount = this.subtotal + this.vatAmount;
  }

  addItem(itemData) {
    const item = new InvoiceItem(itemData);
    this.items.push(item);
    this.recalculateTotals();
    return item;
  }

  removeItem(itemId) {
    this.items = this.items.filter(item => item.id !== itemId);
    this.recalculateTotals();
  }

  updateItem(itemId, updateData) {
    const index = this.items.findIndex(item => item.id === itemId);
    if (index !== -1) {
      this.items[index] = new InvoiceItem({ ...this.items[index], ...updateData });
      this.recalculateTotals();
    }
  }

  validate() {
    const errors = [];

    if (!this.customerId) errors.push('Customer is required');
    if (!this.items || this.items.length === 0) errors.push('At least one item is required');
    if (this.subtotal <= 0) errors.push('Invoice total must be greater than zero');
    
    // Validate items
    this.items.forEach((item, index) => {
      if (!item.description) errors.push(`Item ${index + 1}: Description is required`);
      if (item.quantity <= 0) errors.push(`Item ${index + 1}: Quantity must be greater than zero`);
      if (item.unitPrice < 0) errors.push(`Item ${index + 1}: Unit price cannot be negative`);
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  canEdit() {
    return ['draft'].includes(this.status);
  }

  canFinalize() {
    return this.status === 'draft' && this.validate().isValid;
  }
}

module.exports = { Invoice, InvoiceItem };
