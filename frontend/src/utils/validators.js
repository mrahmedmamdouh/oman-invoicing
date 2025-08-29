import { convertToWesternNumerals } from './formatters';

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Tax Registration Number validation for Oman
export const validateTRN = (trn) => {
  if (!trn) return false;
  
  const cleaned = convertToWesternNumerals(trn).replace(/\D/g, '');
  
  // Oman TRN is 15 digits
  if (cleaned.length !== 15) return false;
  
  // Basic checksum validation (implement actual algorithm)
  return /^\d{15}$/.test(cleaned);
};

// Commercial Registration Number validation
export const validateCRN = (crn) => {
  if (!crn) return false;
  
  const cleaned = convertToWesternNumerals(crn).replace(/\D/g, '');
  
  // Oman CRN is typically 8-10 digits
  return cleaned.length >= 8 && cleaned.length <= 10;
};

// Oman phone number validation
export const validateOmanPhone = (phone) => {
  if (!phone) return false;
  
  const cleaned = convertToWesternNumerals(phone).replace(/\D/g, '');
  
  // Check for local format (8 digits starting with 9, 7, 2)
  if (cleaned.length === 8 && /^[972]/.test(cleaned)) {
    return true;
  }
  
  // Check for international format (+968)
  if (cleaned.length === 11 && cleaned.startsWith('968')) {
    return /^968[972]/.test(cleaned);
  }
  
  return false;
};

// Invoice number validation
export const validateInvoiceNumber = (invoiceNumber) => {
  if (!invoiceNumber) return false;
  
  // Oman invoice numbering standards
  const pattern = /^INV-\d{4}-\d{6,}$/;
  return pattern.test(invoiceNumber);
};

// Amount validation
export const validateAmount = (amount, min = 0, max = 999999.999) => {
  if (typeof amount !== 'number') return false;
  return amount >= min && amount <= max;
};

// Required field validation
export const required = (value) => {
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return !isNaN(value);
  return value != null;
};
