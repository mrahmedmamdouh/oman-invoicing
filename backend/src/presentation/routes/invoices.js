const express = require('express');
const { body, query } = require('express-validator');
const InvoiceController = require('../controllers/InvoiceController');
const authMiddleware = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { standardLimit, createLimit, downloadLimit } = require('../middleware/rateLimit');
const { handleValidationErrors } = require('../middleware/validation');

// Import services and repositories
const InvoiceService = require('../../domain/services/InvoiceService');
const InvoiceRepositoryImpl = require('../../infrastructure/database/repositories/InvoiceRepositoryImpl');
const CustomerRepositoryImpl = require('../../infrastructure/database/repositories/CustomerRepositoryImpl');
const TaxService = require('../../domain/services/TaxService');
const PeppolService = require('../../domain/services/PeppolService');

// Initialize dependencies  
const invoiceRepository = new InvoiceRepositoryImpl();
const customerRepository = new CustomerRepositoryImpl();
const taxService = new TaxService(null, null); // Will need proper tax repository
const peppolService = new PeppolService(null); // Will need proper PEPPOL gateway
const invoiceService = new InvoiceService(invoiceRepository, customerRepository, taxService, peppolService);
const invoiceController = new InvoiceController(invoiceService);

const router = express.Router();

// Validation rules
const createInvoiceValidation = [
  body('customerId').isUUID().withMessage('Valid customer ID is required'),
  body('issueDate').isISO8601().withMessage('Valid issue date is required'),
  body('dueDate').optional().isISO8601().withMessage('Valid due date is required'),
  body('currency').isIn(['OMR', 'USD', 'EUR']).withMessage('Valid currency is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.description').notEmpty().withMessage('Item description is required'),
  body('items.*.quantity').isFloat({ min: 0.01 }).withMessage('Valid quantity is required'),
  body('items.*.unitPrice').isFloat({ min: 0 }).withMessage('Valid unit price is required'),
];

const updateInvoiceValidation = [
  body('customerId').optional().isUUID(),
  body('issueDate').optional().isISO8601(),
  body('dueDate').optional().isISO8601(),
  body('currency').optional().isIn(['OMR', 'USD', 'EUR']),
  body('items').optional().isArray({ min: 1 }),
];

// Routes
router.get('/', 
  standardLimit,
  invoiceController.getInvoices.bind(invoiceController)
);

router.get('/statistics',
  standardLimit,
  invoiceController.getInvoiceStatistics.bind(invoiceController)
);

router.get('/:id',
  standardLimit,
  invoiceController.getInvoiceById.bind(invoiceController)
);

router.get('/:id/download',
  downloadLimit,
  query('format').optional().isIn(['pdf', 'xml']),
  handleValidationErrors,
  invoiceController.downloadInvoice.bind(invoiceController)
);

router.post('/',
  createLimit,
  createInvoiceValidation,
  handleValidationErrors,
  invoiceController.createInvoice.bind(invoiceController)
);

router.put('/:id',
  standardLimit,
  updateInvoiceValidation,
  handleValidationErrors,
  invoiceController.updateInvoice.bind(invoiceController)
);

router.post('/:id/finalize',
  standardLimit,
  requireRole(['admin', 'manager']),
  invoiceController.finalizeInvoice.bind(invoiceController)
);

router.delete('/:id',
  standardLimit,
  requireRole(['admin']),
  invoiceController.deleteInvoice.bind(invoiceController)
);

module.exports = router;