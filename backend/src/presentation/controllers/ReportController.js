class ReportController {
  constructor(reportService) {
    this.reportService = reportService;
  }

  async getSalesReport(req, res, next) {
    try {
      const {
        startDate,
        endDate,
        customerId,
        status,
        currency = 'OMR'
      } = req.query;

      const filters = {
        startDate: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: endDate ? new Date(endDate) : new Date(),
        customerId,
        status,
        currency
      };

      const report = await this.reportService.generateSalesReport(filters);

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  async getTaxReport(req, res, next) {
    try {
      const {
        startDate,
        endDate,
        period = 'monthly'
      } = req.query;

      const filters = {
        startDate: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: endDate ? new Date(endDate) : new Date(),
        period
      };

      const report = await this.reportService.generateTaxReport(filters);

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  async getComplianceReport(req, res, next) {
    try {
      const {
        startDate,
        endDate
      } = req.query;

      const filters = {
        startDate: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: endDate ? new Date(endDate) : new Date()
      };

      const report = await this.reportService.generateComplianceReport(filters);

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  async exportReport(req, res, next) {
    try {
      const { type, format = 'pdf', ...filters } = req.query;

      let reportData;
      switch (type) {
        case 'sales':
          reportData = await this.reportService.generateTaxReport(filters);
          break;
        case 'compliance':
          reportData = await this.reportService.generateComplianceReport(filters);
          break;
        default:
          return res.status(400).json({
            error: 'Invalid report type',
            message_ar: 'نوع التقرير غير صالح'
          });
      }

      const exportedFile = await this.reportService.exportReport(reportData, format, type);

      const contentType = format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const filename = `${type}_report_${new Date().toISOString().split('T')[0]}.${format}`;

      res.set({
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`
      });

      res.send(exportedFile);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ReportController;
