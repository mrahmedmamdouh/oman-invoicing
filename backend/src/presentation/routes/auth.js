const express = require('express');
const { body } = require('express-validator');
const AuthController = require('../controllers/AuthController');
const authMiddleware = require('../middleware/auth');
const rateLimitMiddleware = require('../middleware/rateLimit');

const authController = new AuthController(/* inject auth service */);

const router = express.Router();

// Validation rules
const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const registerValidation = [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('taxRegistrationNumber').optional().isLength({ min: 10 }),
  body('commercialRegistrationNumber').optional().isLength({ min: 8 }),
];

const updateProfileValidation = [
  body('fullName').optional().notEmpty(),
  body('fullNameAr').optional(),
  body('taxRegistrationNumber').optional().isLength({ min: 10 }),
  body('commercialRegistrationNumber').optional().isLength({ min: 8 }),
];

// Routes
router.post('/login',
  rateLimitMiddleware.loginLimit,
  loginValidation,
  authController.login.bind(authController)
);

router.post('/register',
  rateLimitMiddleware.registerLimit,
  registerValidation,
  authController.register.bind(authController)
);

router.post('/refresh',
  rateLimitMiddleware.standardLimit,
  authController.refreshToken.bind(authController)
);

router.post('/logout',
  authMiddleware,
  authController.logout.bind(authController)
);

router.get('/me',
  authMiddleware,
  authController.getCurrentUser.bind(authController)
);

router.put('/profile',
  authMiddleware,
  updateProfileValidation,
  authController.updateProfile.bind(authController)
);

module.exports = router;