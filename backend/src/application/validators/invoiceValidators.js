const { body } = require('express-validator');

const createInvoiceValidation = [
  body('customerId')
    .isUUID()
    .withMessage('Valid customer ID is required'),
  
  body('issueDate')
    .isISO8601()
    .withMessage('Valid issue date is required')
    .toDate(),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Valid due date is required')
    .toDate()
    .custom((value, { req }) => {
      if (value && new Date(value) <= new Date(req.body.issueDate)) {
        throw new Error('Due date must be after issue date');
      }
      return true;
    }),
  
  body('currency')
    .optional()
    .isIn(['OMR', 'USD', 'EUR', 'SAR', 'AED'])
    .withMessage('Invalid currency'),
  
  body('exchangeRate')
    .optional()
    .isFloat({ min: 0.001, max: 1000 })
    .withMessage('Exchange rate must be a positive number'),
  
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  
  body('items.*.description')
    .isLength({ min: 1, max: 500 })
    .withMessage('Item description is required and must be less than 500 characters'),
  
  body('items.*.descriptionAr')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Arabic description must be less than 500 characters')
    .matches(/^[\u0600-\u06FF\s\-\.\(\)\/\,\d]*$/)
    .withMessage('Arabic description contains invalid characters'),
  
  body('items.*.quantity')
    .isFloat({ min: 0.001, max: 999999 })
    .withMessage('Item quantity must be a positive number'),
  
  body('items.*.unitPrice')
    .isFloat({ min: 0, max: 999999.999 })
    .withMessage('Item unit price must be a non-negative number'),
  
  body('items.*.unit')
    .optional()
    .isIn(['piece', 'kg', 'gram', 'liter', 'meter', 'hour', 'day', 'month', 'year', 'box', 'carton', 'bottle', 'can'])
    .withMessage('Invalid unit of measure'),
  
  body('items.*.taxable')
    .optional()
    .isBoolean()
    .withMessage('Taxable field must be boolean'),
  
  body('items.*.productCode')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Product code too long')
];

const updateInvoiceValidation = [
  body('customerId')
    .optional()
    .isUUID()
    .withMessage('Valid customer ID is required'),
  
  body('issueDate')
    .optional()
    .isISO8601()
    .withMessage('Valid issue date is required')
    .toDate(),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Valid due date is required')
    .toDate(),
  
  body('currency')
    .optional()
    .isIn(['OMR', 'USD', 'EUR', 'SAR', 'AED'])
    .withMessage('Invalid currency'),
  
  body('items')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one item is required if items are provided'),
  
  body('items.*.description')
    .optional()
    .isLength({ min: 1, max: 500 })
    .withMessage('Item description must be less than 500 characters'),
  
  body('items.*.quantity')
    .optional()
    .isFloat({ min: 0.001, max: 999999 })
    .withMessage('Item quantity must be a positive number'),
  
  body('items.*.unitPrice')
    .optional()
    .isFloat({ min: 0, max: 999999.999 })
    .withMessage('Item unit price must be a non-negative number')
];

const finalizeInvoiceValidation = [
  body('digitalSignature')
    .optional()
    .isBoolean()
    .withMessage('Digital signature flag must be boolean'),
  
  body('sendEmail')
    .optional()
    .isBoolean()
    .withMessage('Send email flag must be boolean'),
  
  body('submitToPeppol')
    .optional()
    .isBoolean()
    .withMessage('Submit to PEPPOL flag must be boolean')
];

module.exports = {
  createInvoiceValidation,
  updateInvoiceValidation,
  finalizeInvoiceValidation
};
