const express = require('express');
const { body } = require('express-validator');
const TaxController = require('../controllers/TaxController');
const { handleValidationErrors } = require('../middleware/validation');
const { requireRole } = require('../middleware/role');
const rateLimitMiddleware = require('../middleware/rateLimit');

const router = express.Router();

const taxController = new TaxController('../../application/services/TaxService');

// Routes
router.get('/config',
  rateLimitMiddleware.standardLimit,
  taxController.getTaxConfiguration.bind(taxController)
);

router.put('/config',
  rateLimitMiddleware.standardLimit,
  requireRole(['admin', 'manager']),
  body('vatRate').isFloat({ min: 0, max: 1 }),
  body('corporateTaxRate').isFloat({ min: 0, max: 1 }),
  body('exemptionThreshold').isFloat({ min: 0 }),
  handleValidationErrors,
  taxController.updateTaxConfiguration.bind(taxController)
);

router.post('/validate-tax-number',
  rateLimitMiddleware.standardLimit,
  body('taxNumber').isLength({ min: 15, max: 15 }),
  handleValidationErrors,
  taxController.validateTaxNumber.bind(taxController)
);

router.post('/vat-return',
  rateLimitMiddleware.standardLimit,
  requireRole(['admin', 'manager', 'accountant']),
  body('period').isIn(['monthly', 'quarterly', 'annually']),
  body('startDate').isISO8601().toDate(),
  body('endDate').isISO8601().toDate(),
  handleValidationErrors,
  taxController.submitVATReturn.bind(taxController)
);

router.get('/rates',
  rateLimitMiddleware.standardLimit,
  taxController.getTaxRates.bind(taxController)
);

module.exports = router;
