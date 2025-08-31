const express = require('express');
const { body } = require('express-validator');
const AuthController = require('../controllers/AuthController');
const authMiddleware = require('../middleware/auth');
const { standardLimit, loginLimit } = require('../middleware/rateLimit');
const { handleValidationErrors } = require('../middleware/validation');
const ReportController = require('../controllers/ReportController');
const { requirePermission } = require('../middleware/role');
const { standardLimit, downloadLimit } = require('../middleware/rateLimit');

// Import services and repositories
const AuthService = require('../../domain/services/AuthService');
const UserRepositoryImpl = require('../../infrastructure/database/repositories/UserRepositoryImpl');
const { redisClient } = require('../../config/redis');
const ReportService = require('../../domain/services/ReportService');
const GenerateReportUseCase = require('../../application/use-cases/GenerateReport');
const InvoiceRepositoryImpl = require('../../infrastructure/database/repositories/InvoiceRepositoryImpl');
const CustomerRepositoryImpl = require('../../infrastructure/database/repositories/CustomerRepositoryImpl');

const userRepository = new UserRepositoryImpl();
const authService = new AuthService(userRepository, redisClient);
const authController = new AuthController(authService);

const invoiceRepository = new InvoiceRepositoryImpl();
const customerRepository = new CustomerRepositoryImpl();
const generateReportUseCase = new GenerateReportUseCase(invoiceRepository, customerRepository);
const reportService = new ReportService(invoiceRepository, customerRepository, generateReportUseCase);
const reportController = new ReportController(reportService);

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
  loginLimit,
  loginValidation,
  handleValidationErrors,
  authController.login.bind(authController)
);

router.post('/register',
  standardLimit,
  registerValidation,
  handleValidationErrors,
  authController.register.bind(authController)
);

router.post('/refresh',
  standardLimit,
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
  handleValidationErrors,
  authController.updateProfile.bind(authController)
);


// Validation for date ranges
const dateRangeValidation = [
  body('startDate').optional().isISO8601().toDate(),
  body('endDate').optional().isISO8601().toDate()
];

// Routes
router.get('/sales',
  standardLimit,
  requirePermission('view_reports'),
  dateRangeValidation,
  handleValidationErrors,
  reportController.getSalesReport.bind(reportController)
);

router.get('/tax',
  standardLimit,
  requirePermission('view_reports'),
  dateRangeValidation,
  handleValidationErrors,
  reportController.getTaxReport.bind(reportController)
);

router.get('/compliance',
  standardLimit,
  requirePermission('view_reports'),
  dateRangeValidation,
  handleValidationErrors,
  reportController.getComplianceReport.bind(reportController)
);

router.get('/export',
  downloadLimit,
  requirePermission('view_reports'),
  body('type').isIn(['sales', 'tax', 'compliance']),
  body('format').optional().isIn(['pdf', 'excel']),
  handleValidationErrors,
  reportController.exportReport.bind(reportController)
);

module.exports = router;
