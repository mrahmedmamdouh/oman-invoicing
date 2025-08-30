const { body } = require('express-validator');

const createCustomerValidation = [
  body('name')
    .isLength({ min: 2, max: 100 })
    .withMessage('Customer name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\u0600-\u06FF\s\-\.]+$/)
    .withMessage('Customer name contains invalid characters'),
  
  body('nameAr')
    .optional()
    .matches(/^[\u0600-\u06FF\s\-\.]*$/)
    .withMessage('Arabic name can only contain Arabic letters, spaces, hyphens, and dots'),
  
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .matches(/^(\+968|968|0)?[972]\d{7}$/)
    .withMessage('Invalid Oman phone number format'),
  
  body('taxRegistrationNumber')
    .optional()
    .isLength({ min: 15, max: 15 })
    .withMessage('Tax registration number must be 15 digits')
    .isNumeric()
    .withMessage('Tax registration number must contain only numbers'),
  
  body('commercialRegistrationNumber')
    .optional()
    .isLength({ min: 8, max: 10 })
    .withMessage('Commercial registration number must be 8-10 characters'),
  
  body('peppolId')
    .optional()
    .matches(/^\d{4}:\d{15}$/)
    .withMessage('Invalid PEPPOL ID format'),
  
  body('customerType')
    .isIn(['individual', 'business'])
    .withMessage('Customer type must be either individual or business'),
  
  body('address.street')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Street address too long'),
  
  body('address.city')
    .optional()
    .isLength({ max: 50 })
    .withMessage('City name too long'),
  
  body('address.state')
    .optional()
    .isIn(['muscat', 'dhofar', 'ad_dakhiliyah', 'ash_sharqiyah_north', 'ash_sharqiyah_south', 
           'al_batinah_north', 'al_batinah_south', 'al_buraymi', 'ad_dhahirah', 'al_wusta', 'musandam'])
    .withMessage('Invalid Oman governorate'),
  
  body('address.postalCode')
    .optional()
    .matches(/^\d{3}$/)
    .withMessage('Postal code must be 3 digits'),
  
  body('address.country')
    .optional()
    .equals('OM')
    .withMessage('Country must be OM for Oman'),
  
  body('creditLimit')
    .optional()
    .isFloat({ min: 0, max: 999999.999 })
    .withMessage('Credit limit must be a positive number'),
  
  body('paymentTerms')
    .optional()
    .isInt({ min: 0, max: 365 })
    .withMessage('Payment terms must be between 0 and 365 days'),
  
  body('currency')
    .optional()
    .isIn(['OMR', 'USD', 'EUR', 'SAR', 'AED'])
    .withMessage('Invalid currency')
];

const updateCustomerValidation = [
  ...createCustomerValidation.map(validation => {
    // Make all fields optional for updates
    return validation.optional();
  })
];

module.exports = {
  createCustomerValidation,
  updateCustomerValidation
};
