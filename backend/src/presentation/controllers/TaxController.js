class TaxController {
  constructor(taxService) {
    this.taxService = taxService;
  }

  async getTaxConfiguration(req, res, next) {
    try {
      const config = await this.taxService.getTaxConfiguration('OM');

      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTaxConfiguration(req, res, next) {
    try {
      const config = await this.taxService.updateTaxConfiguration(req.body);

      res.json({
        success: true,
        data: config,
        message: 'Tax configuration updated successfully',
        message_ar: 'تم تحديث إعدادات الضرائب بنجاح'
      });
    } catch (error) {
      next(error);
    }
  }

  async validateTaxNumber(req, res, next) {
    try {
      const { taxNumber } = req.body;
      const result = await this.taxService.validateTaxNumber(taxNumber);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async submitVATReturn(req, res, next) {
    try {
      const { period, startDate, endDate } = req.body;
      const result = await this.taxService.submitVATReturn({
        period,
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      });

      res.json({
        success: true,
        data: result,
        message: 'VAT return submitted successfully',
        message_ar: 'تم تقديم إقرار ضريبة القيمة المضافة بنجاح'
      });
    } catch (error) {
      next(error);
    }
  }

  async getTaxRates(req, res, next) {
    try {
      const rates = await this.taxService.getCurrentTaxRates();

      res.json({
        success: true,
        data: rates
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TaxController;
