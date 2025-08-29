const express = require('express');
const { query } = require('express-validator');
const ReportController = require('../controllers/ReportController');
const { handleValidationErrors } = require('../middleware/validation');
const { requirePermission } = require('../middleware/role');
const rateLimitMiddleware = require('../middleware/rateLimit');

const router = express.Router();

const reportController = new ReportController('../../application/services/ReportService');

// Validation for date ranges
const dateRangeValidation = [
  query('startDate').optional().isISO8601().toDate(),
  query('endDate').optional().isISO8601().toDate()
];

// Routes
router.get('/sales',
  rateLimitMiddleware.standardLimit,
  requirePermission('view_reports'),
  dateRangeValidation,
  handleValidationErrors,
  reportController.getSalesReport.bind(reportController)
);

router.get('/tax',
  rateLimitMiddleware.standardLimit,
  requirePermission('view_reports'),
  dateRangeValidation,
  handleValidationErrors,
  reportController.getTaxReport.bind(reportController)
);

router.get('/compliance',
  rateLimitMiddleware.standardLimit,
  requirePermission('view_reports'),
  dateRangeValidation,
  handleValidationErrors,
  reportController.getComplianceReport.bind(reportController)
);

router.get('/export',
  rateLimitMiddleware.downloadLimit,
  requirePermission('view_reports'),
  query('type').isIn(['sales', 'tax', 'compliance']),
  query('format').optional().isIn(['pdf', 'excel']),
  handleValidationErrors,
  reportController.exportReport.bind(reportController)
);

module.exports = router;
