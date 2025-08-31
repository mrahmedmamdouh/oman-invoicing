const express = require('express');
const { body } = require('express-validator');
const TaxController = require('../controllers/TaxController');
const { handleValidationErrors } = require('../middleware/validation');
const { requireRole } = require('../middleware/role');
const { standardLimit } = require('../middleware/rateLimit');

// Import services
const TaxService = require('../../domain/services/TaxService');

const router = express.Router();

// Initialize dependencies (simplified for now)
const taxService = new TaxService(null, null); // Will be properly injected in production
const taxController = new TaxController(taxService);

// Routes
router.get('/config',
  standardLimit,
  taxController.getTaxConfiguration.bind(taxController)
);

router.put('/config',
  standardLimit,
  requireRole(['admin', 'manager']),
  body('vatRate').optional().isFloat({ min: 0, max: 1 }),
  body('corporateTaxRate').optional().isFloat({ min: 0, max: 1 }),
  body('exemptionThreshold').optional().isFloat({ min: 0 }),
  handleValidationErrors,
  taxController.updateTaxConfiguration.bind(taxController)
);

router.post('/validate-tax-number',
  standardLimit,
  body('taxNumber').isLength({ min: 15, max: 15 }),
  handleValidationErrors,
  taxController.validateTaxNumber.bind(taxController)
);

router.post('/vat-return',
  standardLimit,
  requireRole(['admin', 'manager', 'accountant']),
  body('period').isIn(['monthly', 'quarterly', 'annually']),
  body('startDate').isISO8601().toDate(),
  body('endDate').isISO8601().toDate(),
  handleValidationErrors,
  taxController.submitVATReturn.bind(taxController)
);

router.get('/rates',
  standardLimit,
  taxController.getTaxRates.bind(taxController)
);

module.exports = router;