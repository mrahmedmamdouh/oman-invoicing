const { body } = require('express-validator');

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('fullName')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\u0600-\u06FF\s]+$/)
    .withMessage('Full name can only contain letters and spaces'),
  
  body('fullNameAr')
    .optional()
    .matches(/^[\u0600-\u06FF\s]+$/)
    .withMessage('Arabic name can only contain Arabic letters and spaces'),
  
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'accountant', 'user'])
    .withMessage('Invalid role'),
  
  body('taxRegistrationNumber')
    .optional()
    .isLength({ min: 15, max: 15 })
    .withMessage('Tax registration number must be 15 digits')
    .isNumeric()
    .withMessage('Tax registration number must contain only numbers'),
  
  body('commercialRegistrationNumber')
    .optional()
    .isLength({ min: 8, max: 10 })
    .withMessage('Commercial registration number must be 8-10 characters')
];

const updateProfileValidation = [
  body('fullName')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  
  body('fullNameAr')
    .optional()
    .matches(/^[\u0600-\u06FF\s]*$/)
    .withMessage('Arabic name can only contain Arabic letters and spaces'),
  
  body('language')
    .optional()
    .isIn(['ar', 'en'])
    .withMessage('Language must be either ar or en')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    })
];

module.exports = {
  loginValidation,
  registerValidation,
  updateProfileValidation,
  changePasswordValidation
};
