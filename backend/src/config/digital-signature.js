module.exports = {
  PKI_CERTIFICATE_PATH: process.env.PKI_CERTIFICATE_PATH,
  PKI_CERTIFICATE_PASSWORD: process.env.PKI_CERTIFICATE_PASSWORD,
  PKI_PROVIDER: process.env.PKI_PROVIDER || 'Oman_PKI',
  
  SIGNATURE_ALGORITHM: 'RSA-SHA256',
  CERTIFICATE_VALIDATION_URL: 'https://pki.oman.om/validate',
  
  // Certificate settings
  CERTIFICATE_RENEWAL_DAYS: 30, // Days before expiry to renew
  SIGNATURE_TIMESTAMP_REQUIRED: true,
  
  // OCSP settings
  OCSP_RESPONDER_URL: 'http://ocsp.oman.om',
  OCSP_TIMEOUT: 10000 // 10 seconds
};
