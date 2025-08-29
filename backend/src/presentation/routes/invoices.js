const express = require('express');
const { body, query } = require('express-validator');
const InvoiceController = require('../controllers/InvoiceController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const rateLimitMiddleware = require('../middleware/rateLimit');

// Initialize controller with dependencies (would be done through DI container in real app)
const invoiceController = new InvoiceController(/* inject invoice service */);

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
  rateLimitMiddleware.standardLimit,
  invoiceController.getInvoices.bind(invoiceController)
);

router.get('/statistics',
  rateLimitMiddleware.standardLimit,
  invoiceController.getInvoiceStatistics.bind(invoiceController)
);

router.get('/:id',
  rateLimitMiddleware.standardLimit,
  invoiceController.getInvoiceById.bind(invoiceController)
);

router.get('/:id/download',
  rateLimitMiddleware.downloadLimit,
  query('format').optional().isIn(['pdf', 'xml']),
  invoiceController.downloadInvoice.bind(invoiceController)
);

router.post('/',
  rateLimitMiddleware.createLimit,
  createInvoiceValidation,
  invoiceController.createInvoice.bind(invoiceController)
);

router.put('/:id',
  rateLimitMiddleware.standardLimit,
  updateInvoiceValidation,
  invoiceController.updateInvoice.bind(invoiceController)
);

router.post('/:id/finalize',
  rateLimitMiddleware.standardLimit,
  roleMiddleware.requireRole(['admin', 'manager']),
  invoiceController.finalizeInvoice.bind(invoiceController)
);

router.delete('/:id',
  rateLimitMiddleware.standardLimit,
  roleMiddleware.requireRole(['admin']),
  invoiceController.deleteInvoice.bind(invoiceController)
);

module.exports = router;
