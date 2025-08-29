const axios = require('axios');
const xml2js = require('xml2js');
const logger = require('../../shared/utils/logger');

class OmanTaxAuthority {
  constructor() {
    this.baseURL = process.env.OTA_API_URL;
    this.apiKey = process.env.OTA_API_KEY;
    this.environment = process.env.OTA_ENVIRONMENT || 'sandbox';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-Environment': this.environment
      }
    });
  }

  async submitInvoice(invoice) {
    try {
      const otaInvoiceData = this.transformToOTAFormat(invoice);
      
      const response = await this.client.post('/invoices/submit', otaInvoiceData);
      
      logger.info('Invoice submitted to OTA', { 
        invoiceId: invoice.id,
        otaReference: response.data.referenceNumber 
      });

      return {
        success: true,
        referenceNumber: response.data.referenceNumber,
        submissionId: response.data.submissionId,
        submissionDate: new Date(),
        status: response.data.status
      };
    } catch (error) {
      logger.error('OTA submission failed', {
        invoiceId: invoice.id,
        error: error.response?.data || error.message
      });

      throw new Error(`OTA submission failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async getSubmissionStatus(submissionId) {
    try {
      const response = await this.client.get(`/submissions/${submissionId}/status`);
      return response.data;
    } catch (error) {
      logger.error('Failed to get OTA submission status', {
        submissionId,
        error: error.response?.data || error.message
      });
      throw error;
    }
  }

  async validateTaxNumber(taxNumber) {
    try {
      const response = await this.client.post('/validate/tax-number', {
        taxRegistrationNumber: taxNumber
      });
      
      return {
        isValid: response.data.valid,
        companyName: response.data.companyName,
        status: response.data.status,
        registrationDate: response.data.registrationDate
      };
    } catch (error) {
      logger.error('Tax number validation failed', { taxNumber, error: error.message });
      return { isValid: false, error: error.message };
    }
  }

  async submitVATReturn(vatData) {
    try {
      const response = await this.client.post('/vat/return', vatData);
      
      logger.info('VAT return submitted to OTA', {
        period: vatData.period,
        otaReference: response.data.referenceNumber
      });

      return response.data;
    } catch (error) {
      logger.error('VAT return submission failed', {
        period: vatData.period,
        error: error.response?.data || error.message
      });
      throw error;
    }
  }

  transformToOTAFormat(invoice) {
    return {
      invoiceType: 'STANDARD',
      invoiceNumber: invoice.invoiceNumber,
      issueDate: invoice.issueDate.toISOString(),
      dueDate: invoice.dueDate?.toISOString(),
      
      supplier: {
        taxRegistrationNumber: invoice.taxRegistrationNumber,
        commercialRegistrationNumber: invoice.commercialRegistrationNumber,
        name: process.env.COMPANY_NAME || 'Your Company',
        nameAr: process.env.COMPANY_NAME_AR || 'شركتك'
      },
      
      customer: {
        taxRegistrationNumber: invoice.customer?.taxRegistrationNumber,
        commercialRegistrationNumber: invoice.customer?.commercialRegistrationNumber,
        name: invoice.customer?.name,
        nameAr: invoice.customer?.nameAr,
        address: invoice.customer?.address
      },
      
      currency: invoice.currency,
      exchangeRate: invoice.exchangeRate || 1.0,
      
      lineItems: invoice.items.map((item, index) => ({
        lineNumber: index + 1,
        description: item.description,
        descriptionAr: item.descriptionAr,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.total,
        taxable: item.taxable,
        vatRate: item.vatRate,
        vatAmount: item.taxable ? item.total * item.vatRate : 0,
        unit: item.unit,
        productCode: item.productCode
      })),
      
      summary: {
        subtotal: invoice.subtotal,
        totalVAT: invoice.vatAmount,
        totalAmount: invoice.totalAmount,
        vatBreakdown: [
          {
            rate: invoice.vatRate,
            taxableAmount: invoice.subtotal,
            vatAmount: invoice.vatAmount
          }
        ]
      },
      
      digitalSignature: invoice.digitalSignature ? {
        signatureValue: invoice.digitalSignature.signatureValue,
        certificateId: invoice.digitalSignature.certificateId,
        timestamp: invoice.digitalSignature.timestamp
      } : null,
      
      qrCode: invoice.qrCode
    };
  }

  async getTaxRates() {
    try {
      const response = await this.client.get('/tax-rates/current');
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch tax rates from OTA', { error: error.message });
      
      // Return default Oman tax rates as fallback
      return {
        vatRate: 0.05,
        corporateTaxRate: 0.15,
        vatThreshold: 38500,
        effectiveDate: '2021-04-16'
      };
    }
  }
}

module.exports = OmanTaxAuthority;
