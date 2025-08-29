class TaxConfiguration {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.country = data.country || 'OM';
    this.vatRate = data.vatRate || 0.05; // 5% VAT
    this.corporateTaxRate = data.corporateTaxRate || 0.15; // 15% Corporate Tax
    this.exemptionThreshold = data.exemptionThreshold || 38500; // OMR 38,500 VAT threshold
    this.effectiveFrom = data.effectiveFrom || new Date();
    this.effectiveTo = data.effectiveTo;
    this.isActive = data.isActive !== false;
    
    // Oman Tax Authority configuration
    this.otaApiEndpoint = data.otaApiEndpoint;
    this.otaApiKey = data.otaApiKey;
    this.reportingFrequency = data.reportingFrequency || 'quarterly'; // monthly, quarterly, annually
    
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }
}
