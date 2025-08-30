import { apiMethods } from './api';

const customersService = {
  async getCustomers(params = {}) {
    return await apiMethods.get('/customers', params);
  },

  async getCustomerById(id) {
    return await apiMethods.get(`/customers/${id}`);
  },

  async createCustomer(customerData) {
    return await apiMethods.post('/customers', customerData);
  },

  async updateCustomer(id, customerData) {
    return await apiMethods.put(`/customers/${id}`, customerData);
  },

  async deleteCustomer(id) {
    return await apiMethods.delete(`/customers/${id}`);
  },

  async searchCustomers(query) {
    return await apiMethods.get('/customers/search', { query });
  },

  async validateTaxNumber(taxNumber) {
    return await apiMethods.post('/customers/validate-tax', { taxNumber });
  },

  async getCustomerInvoices(id, params = {}) {
    return await apiMethods.get(`/customers/${id}/invoices`, params);
  },

  async getCustomerStatistics(id) {
    return await apiMethods.get(`/customers/${id}/statistics`);
  }
};

export default customersService;
