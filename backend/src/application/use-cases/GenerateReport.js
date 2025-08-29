class GenerateReportUseCase {
  constructor(invoiceRepository, customerRepository) {
    this.invoiceRepository = invoiceRepository;
    this.customerRepository = customerRepository;
  }

  async executeSalesReport(filters) {
    const invoices = await this.invoiceRepository.findByDateRange(
      filters.startDate,
      filters.endDate
    );

    const summary = this.calculateSalesSummary(invoices);
    const trend = this.calculateSalesTrend(invoices, filters.period || 'daily');
    const topCustomers = this.calculateTopCustomers(invoices);
    const customerBreakdown = this.calculateCustomerBreakdown(invoices);

    return {
      summary,
      trend,
      topCustomers,
      customerBreakdown,
      invoices: invoices.map(invoice => ({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        customer: invoice.customer,
        issueDate: invoice.issueDate,
        totalAmount: invoice.totalAmount,
        vatAmount: invoice.vatAmount,
        status: invoice.status,
        currency: invoice.currency
      }))
    };
  }

  calculateSalesSummary(invoices) {
    return {
      totalInvoices: invoices.length,
      totalAmount: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
      totalVAT: invoices.reduce((sum, inv) => sum + inv.vatAmount, 0),
      averageAmount: invoices.length > 0 ? 
        invoices.reduce((sum, inv) => sum + inv.totalAmount, 0) / invoices.length : 0,
      paidInvoices: invoices.filter(inv => inv.status === 'paid').length,
      pendingInvoices: invoices.filter(inv => inv.status === 'sent').length,
      overdueInvoices: invoices.filter(inv => 
        inv.status === 'sent' && new Date(inv.dueDate) < new Date()
      ).length
    };
  }

  calculateSalesTrend(invoices, period = 'daily') {
    const groupedData = {};
    
    invoices.forEach(invoice => {
      let key;
      const date = new Date(invoice.issueDate);
      
      switch (period) {
        case 'daily':
          key = date.toISOString().split('T')[0];
          break;
        case 'weekly':
          const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'monthly':
          key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }
      
      if (!groupedData[key]) {
        groupedData[key] = { date: key, amount: 0, count: 0 };
      }
      
      groupedData[key].amount += invoice.totalAmount;
      groupedData[key].count += 1;
    });

    return Object.values(groupedData).sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  calculateTopCustomers(invoices) {
    const customerData = {};
    
    invoices.forEach(invoice => {
      const customerId = invoice.customerId;
      const customerName = invoice.customer?.name || 'Unknown';
      
      if (!customerData[customerId]) {
        customerData[customerId] = {
          customerId,
          customerName,
          invoiceCount: 0,
          totalAmount: 0
        };
      }
      
      customerData[customerId].invoiceCount += 1;
      customerData[customerId].totalAmount += invoice.totalAmount;
    });

    return Object.values(customerData)
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 10);
  }

  calculateCustomerBreakdown(invoices) {
    const breakdown = this.calculateTopCustomers(invoices);
    return breakdown.slice(0, 5).map(item => ({
      customerName: item.customerName,
      amount: item.totalAmount
    }));
  }

  async executeTaxReport(filters) {
    const invoices = await this.invoiceRepository.findByDateRange(
      filters.startDate,
      filters.endDate
    );

    const vatSummary = this.calculateVATSummary(invoices);
    const corporateTaxSummary = this.calculateCorporateTaxSummary(invoices);
    const monthlyBreakdown = this.calculateMonthlyTaxBreakdown(invoices);

    return {
      period: {
        startDate: filters.startDate,
        endDate: filters.endDate
      },
      vatSummary,
      corporateTaxSummary,
      monthlyBreakdown,
      invoices: invoices.filter(inv => inv.vatAmount > 0 || inv.corporateTaxAmount > 0)
    };
  }

  calculateVATSummary(invoices) {
    const vatInvoices = invoices.filter(inv => inv.vatAmount > 0);
    
    return {
      totalVATCollected: vatInvoices.reduce((sum, inv) => sum + inv.vatAmount, 0),
      taxableAmount: vatInvoices.reduce((sum, inv) => sum + inv.subtotal, 0),
      numberOfVATInvoices: vatInvoices.length,
      averageVATPerInvoice: vatInvoices.length > 0 ? 
        vatInvoices.reduce((sum, inv) => sum + inv.vatAmount, 0) / vatInvoices.length : 0
    };
  }

  calculateCorporateTaxSummary(invoices) {
    const corporateTaxInvoices = invoices.filter(inv => inv.corporateTaxAmount > 0);
    
    return {
      totalCorporateTax: corporateTaxInvoices.reduce((sum, inv) => sum + inv.corporateTaxAmount, 0),
      taxableAmount: corporateTaxInvoices.reduce((sum, inv) => sum + inv.subtotal, 0),
      numberOfInvoices: corporateTaxInvoices.length
    };
  }

  calculateMonthlyTaxBreakdown(invoices) {
    const monthlyData = {};
    
    invoices.forEach(invoice => {
      const date = new Date(invoice.issueDate);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          vatAmount: 0,
          corporateTaxAmount: 0,
          invoiceCount: 0,
          totalSales: 0
        };
      }
      
      monthlyData[monthKey].vatAmount += invoice.vatAmount;
      monthlyData[monthKey].corporateTaxAmount += invoice.corporateTaxAmount;
      monthlyData[monthKey].invoiceCount += 1;
      monthlyData[monthKey].totalSales += invoice.totalAmount;
    });

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  }
}

module.exports = GenerateReportUseCase;
