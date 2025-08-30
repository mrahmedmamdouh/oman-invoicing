import { apiMethods } from './api';

const peppolService = {
  async submitInvoice(invoiceId, options = {}) {
    return await apiMethods.post(`/peppol/submit/${invoiceId}`, options);
  },

  async getMessageStatus(messageId) {
    return await apiMethods.get(`/peppol/status/${messageId}`);
  },

  async validateParticipant(participantId) {
    return await apiMethods.post('/peppol/validate-participant', { participantId });
  },

  async getConfiguration() {
    return await apiMethods.get('/peppol/config');
  },

  async testConnection() {
    return await apiMethods.post('/peppol/test-connection');
  },

  async getMessages(params = {}) {
    return await apiMethods.get('/peppol/messages', params);
  },

  async downloadDocument(messageId) {
    return await apiMethods.downloadFile(`/peppol/messages/${messageId}/document`, `peppol-document-${messageId}.xml`);
  }
};

export default peppolService;
