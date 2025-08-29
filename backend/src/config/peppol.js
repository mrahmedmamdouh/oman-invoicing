module.exports = {
  PEPPOL_GATEWAY_URL: process.env.PEPPOL_GATEWAY_URL,
  PEPPOL_PARTICIPANT_ID: process.env.PEPPOL_PARTICIPANT_ID,
  PEPPOL_CERTIFICATE_PATH: process.env.PEPPOL_CERTIFICATE_PATH,
  PEPPOL_CERTIFICATE_PASSWORD: process.env.PEPPOL_CERTIFICATE_PASSWORD,
  
  // PEPPOL Document Types
  DOCUMENT_TYPES: {
    INVOICE: 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
    CREDIT_NOTE: 'urn:oasis:names:specification:ubl:schema:xsd:CreditNote-2',
    DEBIT_NOTE: 'urn:oasis:names:specification:ubl:schema:xsd:DebitNote-2'
  },
  
  // UBL Specifications
  UBL_VERSION: '2.1',
  CUSTOMIZATION_ID: 'urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0',
  PROFILE_ID: 'urn:fdc:peppol.eu:2017:poacc:billing:01:1.0'
};
