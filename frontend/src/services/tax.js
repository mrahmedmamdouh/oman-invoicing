import { apiMethods } from './api';

const taxService = {
  async getTaxConfiguration() {
    return await apiMethods.get('/tax/config');
  },

  async updateTaxConfiguration(config) {
    return await apiMethods.put('/tax/config', config);
  },

  async validateTaxNumber(taxNumber) {
    return await apiMethods.post('/tax/validate-tax-number', { taxNumber });
  },

  async getCurrentTaxRates() {
    return await apiMethods.get('/tax/rates');
  },

  async submitVATReturn(data) {
    return await apiMethods.post('/tax/vat-return', data);
  },

  async getVATReturns(params = {}) {
    return await apiMethods.get('/tax/vat-returns', params);
  },

  async calculateTax(invoiceData) {
    return await apiMethods.post('/tax/calculate', invoiceData);
  }
};

export default taxService;
