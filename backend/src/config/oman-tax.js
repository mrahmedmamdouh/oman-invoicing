module.exports = {
  OTA_API_URL: process.env.OTA_API_URL || 'https://api.taxoman.gov.om',
  OTA_API_KEY: process.env.OTA_API_KEY,
  OTA_ENVIRONMENT: process.env.OTA_ENVIRONMENT || 'sandbox',
  
  // Oman Tax Settings
  VAT_RATE: 0.05, // 5%
  CORPORATE_TAX_RATE: 0.15, // 15%
  VAT_THRESHOLD: 38500, // OMR 38,500
  
  // Tax periods
  VAT_PERIOD: 'quarterly', // monthly, quarterly, annually
  CORPORATE_TAX_PERIOD: 'annually',
  
  // Invoice requirements
  INVOICE_RETENTION_YEARS: 10,
  DIGITAL_SIGNATURE_REQUIRED: true,
  QR_CODE_REQUIRED: true
};
