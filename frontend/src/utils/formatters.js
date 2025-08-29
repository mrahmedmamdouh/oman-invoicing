import dayjs from 'dayjs';
import momentHijri from 'moment-hijri';

// Currency formatting for Oman
export const formatCurrency = (amount, currency = 'OMR', locale = 'ar-OM') => {
  if (!amount && amount !== 0) return '—';
  
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 3, // OMR has 3 decimal places
    maximumFractionDigits: 3,
  });
  
  return formatter.format(amount);
};

// Number formatting with Arabic numerals support
export const formatNumber = (number, options = {}) => {
  if (!number && number !== 0) return '—';
  
  const {
    locale = 'ar-OM',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    useArabicNumerals = true
  } = options;
  
  let formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(number);
  
  // Convert to Arabic-Indic numerals if requested
  if (useArabicNumerals && locale.startsWith('ar')) {
    formatted = convertToArabicNumerals(formatted);
  }
  
  return formatted;
};

// Convert Western numerals to Arabic-Indic numerals
export const convertToArabicNumerals = (str) => {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return str.replace(/[0-9]/g, (match) => arabicNumerals[parseInt(match)]);
};

// Convert Arabic-Indic numerals to Western numerals
export const convertToWesternNumerals = (str) => {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return str.replace(/[٠-٩]/g, (match) => arabicNumerals.indexOf(match).toString());
};

// Date formatting with Hijri support
export const formatDate = (date, options = {}) => {
  if (!date) return '—';
  
  const {
    format = 'YYYY/MM/DD',
    locale = 'ar',
    includeHijri = false
  } = options;
  
  const gregorian = dayjs(date).format(format);
  
  if (includeHijri) {
    const hijri = momentHijri(date).format('iYYYY/iM/iD');
    return `${gregorian} (${hijri})`;
  }
  
  return gregorian;
};

// Hijri date formatting
export const formatHijriDate = (date, format = 'iYYYY/iM/iD') => {
  if (!date) return '—';
  return momentHijri(date).format(format);
};

// Percentage formatting
export const formatPercentage = (value, decimals = 1) => {
  if (!value && value !== 0) return '—';
  return `${(value * 100).toFixed(decimals)}%`;
};

// File size formatting
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Phone number formatting for Oman
export const formatOmanPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's an Oman number
  if (cleaned.startsWith('968')) {
    // Format: +968 XX XXX XXX
    return `+968 ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  } else if (cleaned.length === 8) {
    // Local format: XX XXX XXX
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
  }
  
  return phone;
};

// Tax Registration Number formatting
export const formatTRN = (trn) => {
  if (!trn) return '';
  
  // Oman TRN format: XXXXXXXXXXXXXXX (15 digits)
  const cleaned = trn.replace(/\D/g, '');
  
  if (cleaned.length === 15) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 9)}-${cleaned.slice(9, 12)}-${cleaned.slice(12)}`;
  }
  
  return trn;
};

// Commercial Registration Number formatting
export const formatCRN = (crn) => {
  if (!crn) return '';
  
  // Oman CRN format varies by company type
  return crn; // Implement specific formatting as needed
};
