class DigitalSignature {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.invoiceId = data.invoiceId;
    this.certificateId = data.certificateId;
    this.signatureValue = data.signatureValue;
    this.signatureMethod = data.signatureMethod || 'RSA-SHA256';
    this.timestamp = data.timestamp || new Date();
    this.signerName = data.signerName;
    this.signerRole = data.signerRole;
    this.isValid = data.isValid !== false;
    this.validationErrors = data.validationErrors || [];
    
    // Oman PKI specific fields
    this.pkiProvider = data.pkiProvider || 'Oman_PKI';
    this.certificateChain = data.certificateChain || [];
    this.revocationStatus = data.revocationStatus || 'valid';
    
    this.createdAt = data.createdAt || new Date();
  }

  validate() {
    const errors = [];

    if (!this.invoiceId) {
      errors.push('Invoice ID is required');
    }

    if (!this.certificateId) {
      errors.push('Certificate ID is required');
    }

    if (!this.signatureValue) {
      errors.push('Signature value is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = {
  Invoice,
  InvoiceItem,
  Customer,
  TaxConfiguration,
  DigitalSignature
};