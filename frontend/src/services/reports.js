import api from './api';

const reportsService = {
  async getSalesReport(params = {}) {
    return await api.get('/reports/sales', { params });
  },

  async getTaxReport(params = {}) {
    return await api.get('/reports/tax', { params });
  },

  async getComplianceReport(params = {}) {
    return await api.get('/reports/compliance', { params });
  },

  async exportReport(params = {}) {
    return await api.get('/reports/export', { 
      params,
      responseType: 'blob'
    });
  }
};

export default reportsService;