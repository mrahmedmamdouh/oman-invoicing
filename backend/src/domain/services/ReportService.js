const moment = require('moment');
const ExcelJS = require('exceljs');
const PDFGenerator = require('../../shared/utils/pdf');

class ReportService {
  constructor(invoiceRepository, customerRepository, generateReportUseCase) {
    this.invoiceRepository = invoiceRepository;
    this.customerRepository = customerRepository;
    this.generateReportUseCase = generateReportUseCase;
  }

  async generateSalesReport(filters) {
    return await this.generateReportUseCase.executeSalesReport(filters);
  }

  async generateTaxReport(filters) {
    return await this.generateReportUseCase.executeTaxReport(filters);
  }

  async generateComplianceReport(filters) {
    const invoices = await this.invoiceRepository.findByDateRange(
      filters.startDate,
      filters.endDate
    );

    const complianceMetrics = {
      totalInvoices: invoices.length,
      digitallySignedInvoices: invoices.filter(inv => inv.digitalSignature).length,
      peppolSubmittedInvoices: invoices.filter(inv => inv.peppolId).length,
      otaSubmittedInvoices: invoices.filter(inv => inv.status !== 'draft').length,
      qrCodeGeneratedInvoices: invoices.filter(inv => inv.qrCode).length,
      retentionCompliantInvoices: invoices.filter(inv => inv.retentionUntil).length
    };

    const complianceRate = {
      digitalSignature: (complianceMetrics.digitallySignedInvoices / complianceMetrics.totalInvoices * 100).toFixed(2),
      peppol: (complianceMetrics.peppolSubmittedInvoices / complianceMetrics.totalInvoices * 100).toFixed(2),
      ota: (complianceMetrics.otaSubmittedInvoices / complianceMetrics.totalInvoices * 100).toFixed(2),
      qrCode: (complianceMetrics.qrCodeGeneratedInvoices / complianceMetrics.totalInvoices * 100).toFixed(2),
      retention: (complianceMetrics.retentionCompliantInvoices / complianceMetrics.totalInvoices * 100).toFixed(2)
    };

    const nonCompliantInvoices = invoices.filter(invoice => 
      !invoice.digitalSignature || !invoice.qrCode || !invoice.retentionUntil
    );

    return {
      period: {
        startDate: filters.startDate,
        endDate: filters.endDate
      },
      complianceMetrics,
      complianceRate,
      nonCompliantInvoices: nonCompliantInvoices.map(inv => ({
        invoiceNumber: inv.invoiceNumber,
        issueDate: inv.issueDate,
        status: inv.status,
        issues: [
          !inv.digitalSignature && 'Missing digital signature',
          !inv.qrCode && 'Missing QR code',
          !inv.retentionUntil && 'Missing retention date'
        ].filter(Boolean)
      })),
      recommendations: this.generateComplianceRecommendations(complianceMetrics, complianceRate)
    };
  }

  generateComplianceRecommendations(metrics, rates) {
    const recommendations = [];

    if (rates.digitalSignature < 100) {
      recommendations.push({
        type: 'critical',
        title: 'Digital Signature Compliance',
        description: `${100 - rates.digitalSignature}% of invoices lack digital signatures`,
        action: 'Ensure all invoices are digitally signed before finalization',
        priority: 'high'
      });
    }

    if (rates.qrCode < 100) {
      recommendations.push({
        type: 'warning',
        title: 'QR Code Generation',
        description: `${100 - rates.qrCode}% of invoices missing QR codes`,
        action: 'Enable automatic QR code generation for all invoices',
        priority: 'medium'
      });
    }

    if (rates.peppol < 50) {
      recommendations.push({
        type: 'info',
        title: 'PEPPOL Integration',
        description: `Only ${rates.peppol}% of invoices submitted via PEPPOL`,
        action: 'Consider encouraging customers to adopt PEPPOL e-invoicing',
        priority: 'low'
      });
    }

    return recommendations;
  }

  async exportReport(reportData, format, reportType) {
    switch (format.toLowerCase()) {
      case 'pdf':
        return await this.exportToPDF(reportData, reportType);
      case 'excel':
        return await this.exportToExcel(reportData, reportType);
      default:
        throw new Error('Unsupported export format');
    }
  }

  async exportToPDF(reportData, reportType) {
    const pdfGenerator = new PDFGenerator();
    
    // Create a comprehensive PDF report
    const reportContent = {
      title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
      titleAr: this.getArabicReportTitle(reportType),
      generatedAt: new Date(),
      data: reportData
    };

    return await pdfGenerator.generateReportPDF(reportContent);
  }

  async exportToExcel(reportData, reportType) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(reportType.charAt(0).toUpperCase() + reportType.slice(1));

    // Set RTL for Arabic support
    worksheet.views = [{ rightToLeft: true }];

    // Add report header
    worksheet.addRow([`${reportType} Report - تقرير ${this.getArabicReportTitle(reportType)}`]);
    worksheet.addRow([`Generated: ${new Date().toLocaleDateString()}`]);
    worksheet.addRow([]);

    if (reportType === 'sales') {
      this.addSalesDataToExcel(worksheet, reportData);
    } else if (reportType === 'tax') {
      this.addTaxDataToExcel(worksheet, reportData);
    } else if (reportType === 'compliance') {
      this.addComplianceDataToExcel(worksheet, reportData);
    }

    return await workbook.xlsx.writeBuffer();
  }

  addSalesDataToExcel(worksheet, reportData) {
    // Summary section
    worksheet.addRow(['Summary - الملخص']);
    worksheet.addRow(['Total Invoices', 'إجمالي الفواتير', reportData.summary?.totalInvoices || 0]);
    worksheet.addRow(['Total Amount', 'المبلغ الإجمالي', `${reportData.summary?.totalAmount || 0} OMR`]);
    worksheet.addRow(['Total VAT', 'ضريبة القيمة المضافة', `${reportData.summary?.totalVAT || 0} OMR`]);
    worksheet.addRow([]);

    // Invoices details
    worksheet.addRow(['Invoice Details - تفاصيل الفواتير']);
    worksheet.addRow([
      'Invoice Number', 'Customer', 'Date', 'Amount', 'VAT', 'Status',
      'رقم الفاتورة', 'العميل', 'التاريخ', 'المبلغ', 'الضريبة', 'الحالة'
    ]);

    reportData.invoices?.forEach(invoice => {
      worksheet.addRow([
        invoice.invoiceNumber,
        invoice.customer?.name || '',
        moment(invoice.issueDate).format('DD/MM/YYYY'),
        `${invoice.totalAmount} ${invoice.currency}`,
        `${invoice.vatAmount} ${invoice.currency}`,
        invoice.status,
        invoice.invoiceNumber,
        invoice.customer?.nameAr || '',
        moment(invoice.issueDate).format('DD/MM/YYYY'),
        `${invoice.totalAmount} ${invoice.currency}`,
        `${invoice.vatAmount} ${invoice.currency}`,
        this.getArabicStatus(invoice.status)
      ]);
    });
  }

  addTaxDataToExcel(worksheet, reportData) {
    worksheet.addRow(['VAT Summary - ملخص ضريبة القيمة المضافة']);
    worksheet.addRow(['Total VAT Collected', 'إجمالي الضريبة المحصلة', `${reportData.vatSummary?.totalVATCollected || 0} OMR`]);
    worksheet.addRow(['Taxable Amount', 'المبلغ الخاضع للضريبة', `${reportData.vatSummary?.taxableAmount || 0} OMR`]);
    worksheet.addRow([]);

    // Monthly breakdown
    worksheet.addRow(['Monthly Breakdown - التوزيع الشهري']);
    worksheet.addRow(['Month', 'Sales', 'VAT Amount', 'الشهر', 'المبيعات', 'الضريبة']);

    reportData.monthlyBreakdown?.forEach(month => {
      worksheet.addRow([
        month.month,
        `${month.totalSales} OMR`,
        `${month.vatAmount} OMR`,
        month.month,
        `${month.totalSales} ر.ع`,
        `${month.vatAmount} ر.ع`
      ]);
    });
  }

  addComplianceDataToExcel(worksheet, reportData) {
    worksheet.addRow(['Compliance Metrics - مقاييس الامتثال']);
    worksheet.addRow(['Digital Signature Rate', 'معدل التوقيع الرقمي', `${reportData.complianceRate?.digitalSignature}%`]);
    worksheet.addRow(['PEPPOL Submission Rate', 'معدل الإرسال عبر PEPPOL', `${reportData.complianceRate?.peppol}%`]);
    worksheet.addRow(['QR Code Generation Rate', 'معدل إنشاء رمز QR', `${reportData.complianceRate?.qrCode}%`]);
    worksheet.addRow([]);

    // Non-compliant invoices
    if (reportData.nonCompliantInvoices?.length > 0) {
      worksheet.addRow(['Non-Compliant Invoices - الفواتير غير المتوافقة']);
      worksheet.addRow(['Invoice Number', 'Date', 'Issues', 'رقم الفاتورة', 'التاريخ', 'المشاكل']);

      reportData.nonCompliantInvoices.forEach(invoice => {
        worksheet.addRow([
          invoice.invoiceNumber,
          moment(invoice.issueDate).format('DD/MM/YYYY'),
          invoice.issues.join(', '),
          invoice.invoiceNumber,
          moment(invoice.issueDate).format('DD/MM/YYYY'),
          invoice.issues.join('، ')
        ]);
      });
    }
  }

  getArabicReportTitle(reportType) {
    const titles = {
      sales: 'المبيعات',
      tax: 'الضرائب',
      compliance: 'الامتثال'
    };
    return titles[reportType] || reportType;
  }

  getArabicStatus(status) {
    const statuses = {
      draft: 'مسودة',
      sent: 'مُرسل',
      paid: 'مدفوع',
      overdue: 'متأخر',
      cancelled: 'ملغى'
    };
    return statuses[status] || status;
  }
}

module.exports = ReportService;
