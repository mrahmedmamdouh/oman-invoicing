import api from './api';

const invoicesService = {
  async getInvoices(params = {}) {
    return await api.get('/invoices', { params });
  },

  async getInvoiceById(id) {
    return await api.get(`/invoices/${id}`);
  },

  async createInvoice(invoiceData) {
    return await api.post('/invoices', invoiceData);
  },

  async updateInvoice(id, invoiceData) {
    return await api.put(`/invoices/${id}`, invoiceData);
  },

  async deleteInvoice(id) {
    return await api.delete(`/invoices/${id}`);
  },

  async finalizeInvoice(id) {
    return await api.post(`/invoices/${id}/finalize`);
  },

  async sendInvoice(id, emailData) {
    return await api.post(`/invoices/${id}/send`, emailData);
  },

  async downloadInvoice(id, format = 'pdf') {
    return await api.get(`/invoices/${id}/download`, {
      params: { format },
      responseType: 'blob',
    });
  },

  async getInvoiceStatistics(dateRange) {
    return await api.get('/invoices/statistics', { params: dateRange });
  },

  async duplicateInvoice(id) {
    return await api.post(`/invoices/${id}/duplicate`);
  },
};

export default invoicesService;