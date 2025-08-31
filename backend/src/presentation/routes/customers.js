const express = require('express');
const { body, query } = require('express-validator');
const CustomerController = require('../controllers/CustomerController');
const { handleValidationErrors } = require('../middleware/validation');
const { requireRole, requirePermission } = require('../middleware/role');
const { auditLogger } = require('../middleware/audit');
const { standardLimit, createLimit } = require('../middleware/rateLimit');

// Import services and repositories
const CustomerService = require('../../domain/services/CustomerService');
const CustomerRepositoryImpl = require('../../infrastructure/database/repositories/CustomerRepositoryImpl');
const AuditService = require('../../domain/services/AuditService');
const AuditRepositoryImpl = require('../../infrastructure/database/repositories/AuditRepositoryImpl');

const router = express.Router();

// Initialize dependencies
const customerRepository = new CustomerRepositoryImpl();
const auditRepository = new AuditRepositoryImpl();
const auditService = new AuditService(auditRepository);
const customerService = new CustomerService(customerRepository, auditService);
const customerController = new CustomerController(customerService);

// Validation rules
const createCustomerValidation = [
  body('name').notEmpty().withMessage('Customer name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').optional().isMobilePhone('any'),
  body('customerType').isIn(['individual', 'business']).withMessage('Invalid customer type'),
  body('taxRegistrationNumber').optional().isLength({ min: 15, max: 15 }),
  body('commercialRegistrationNumber').optional().isLength({ min: 8, max: 10 }),
];

const updateCustomerValidation = [
  body('name').optional().notEmpty(),
  body('email').optional().isEmail(),
  body('phone').optional().isMobilePhone('any'),
  body('customerType').optional().isIn(['individual', 'business']),
  body('taxRegistrationNumber').optional().isLength({ min: 15, max: 15 }),
  body('commercialRegistrationNumber').optional().isLength({ min: 8, max: 10 }),
];

// Routes
router.get('/',
  standardLimit,
  requirePermission('manage_customers'),
  customerController.getCustomers.bind(customerController)
);

router.get('/search',
  standardLimit,
  query('query').isLength({ min: 2 }),
  handleValidationErrors,
  customerController.searchCustomers.bind(customerController)
);

router.get('/:id',
  standardLimit,
  requirePermission('manage_customers'),
  customerController.getCustomerById.bind(customerController)
);

router.post('/',
  createLimit,
  requirePermission('manage_customers'),
  createCustomerValidation,
  handleValidationErrors,
  auditLogger('create'),
  customerController.createCustomer.bind(customerController)
);

router.put('/:id',
  standardLimit,
  requirePermission('manage_customers'),
  updateCustomerValidation,
  handleValidationErrors,
  auditLogger('update'),
  customerController.updateCustomer.bind(customerController)
);

router.delete('/:id',
  standardLimit,
  requireRole(['admin', 'manager']),
  auditLogger('delete'),
  customerController.deleteCustomer.bind(customerController)
);

module.exports = router;