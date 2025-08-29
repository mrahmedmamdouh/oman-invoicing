const moment = require('moment');

class TaxService {
  constructor(taxRepository, otaIntegration) {
    this.taxRepository = taxRepository;
    this.otaIntegration = otaIntegration;
  }

  async calculateTaxes(invoice) {
    const taxConfig = await this.getTaxConfiguration('OM');
    
    // Calculate VAT
    const vatableAmount = invoice.items
      .filter(item => item.taxable)
      .reduce((sum, item) => sum + item.total, 0);

    invoice.vatAmount = vatableAmount * taxConfig.vatRate;

    // Calculate Corporate Tax (if applicable)
    if (this.isCorporateTaxApplicable(invoice, vatableAmount)) {
      invoice.corporateTaxAmount = vatableAmount * taxConfig.corporateTaxRate;
    }

    invoice.recalculateTotals();
  }

  async getTaxConfiguration(country) {
    let config = await this.taxRepository.findActiveByCountry(country);
    
    if (!config) {
      // Default Oman tax configuration
      config = {
        country: 'OM',
        vatRate: 0.05,
        corporateTaxRate: 0.15,
        exemptionThreshold: 38500
      };
    }

    return config;
  }

  isCorporateTaxApplicable(invoice, amount) {
    // Corporate tax applies to business entities with annual revenue > threshold
    return amount > 0; // Simplified logic - implement proper business rules
  }

  async submitToOTA(invoice) {
    try {
      const otaData = this.transformToOTAFormat(invoice);
      const response = await this.otaIntegration.submitInvoice(otaData);
      
      return {
        success: true,
        referenceNumber: response.referenceNumber,
        submissionDate: new Date()
      };
    } catch (error) {
      throw new Error(`OTA submission failed: ${error.message}`);
    }
  }

  transformToOTAFormat(invoice) {
    return {
      invoiceNumber: invoice.invoiceNumber,
      issueDate: invoice.issueDate,
      supplierTRN: invoice.taxRegistrationNumber,
      customerTRN: invoice.customer?.taxRegistrationNumber,
      lineItems: invoice.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        vatRate: item.vatRate,
        vatAmount: item.total * item.vatRate
      })),
      totalAmount: invoice.totalAmount,
      vatAmount: invoice.vatAmount,
      currency: invoice.currency
    };
  }

  async generateVATReport(period) {
    const startDate = moment(period.start);
    const endDate = moment(period.end);
    
    const invoices = await this.invoiceRepository.findByDateRange(startDate, endDate);
    
    const report = {
      period: {
        start: startDate.format('YYYY-MM-DD'),
        end: endDate.format('YYYY-MM-DD')
      },
      summary: {
        totalSales: 0,
        totalVAT: 0,
        numberOfInvoices: invoices.length
      },
      details: []
    };

    invoices.forEach(invoice => {
      report.summary.totalSales += invoice.subtotal;
      report.summary.totalVAT += invoice.vatAmount;
      
      report.details.push({
        invoiceNumber: invoice.invoiceNumber,
        date: invoice.issueDate,
        customer: invoice.customer?.name,
        amount: invoice.subtotal,
        vatAmount: invoice.vatAmount
      });
    });

    return report;
  }
}
