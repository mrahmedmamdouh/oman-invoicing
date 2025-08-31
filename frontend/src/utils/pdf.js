const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFGenerator {
  constructor() {
    this.doc = null;
    this.arabicFont = path.join(__dirname, '../assets/fonts/NotoSansArabic-Regular.ttf');
    this.englishFont = 'Helvetica';
  }

  // Create new PDF document
  createDocument(options = {}) {
    this.doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      ...options
    });
    
    return this.doc;
  }

  // Add Arabic text support
  addArabicText(text, x, y, options = {}) {
    if (fs.existsSync(this.arabicFont)) {
      this.doc.font(this.arabicFont);
    }
    this.doc.text(text, x, y, { align: 'right', ...options });
    this.doc.font(this.englishFont); // Reset to English font
  }

  // Generate invoice PDF
  async generateInvoicePDF(invoice, outputPath) {
    this.createDocument();
    
    // Header
    this.addHeader(invoice);
    
    // Company info
    this.addCompanyInfo();
    
    // Customer info
    this.addCustomerInfo(invoice.customer);
    
    // Invoice details
    this.addInvoiceDetails(invoice);
    
    // Items table
    this.addItemsTable(invoice.items);
    
    // Totals
    this.addTotals(invoice);
    
    // Footer
    this.addFooter(invoice);
    
    // Finalize PDF
    this.doc.end();
    
    if (outputPath) {
      this.doc.pipe(fs.createWriteStream(outputPath));
    }
    
    return this.doc;
  }

  addHeader(invoice) {
    const { doc } = this;
    
    // Company logo (if exists)
    const logoPath = path.join(__dirname, '../assets/images/logo.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 50, { width: 60 });
    }
    
    // Invoice title in Arabic and English
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .text('INVOICE', 400, 50, { align: 'right' });
       
    this.addArabicText('فاتورة', 350, 75, { fontSize: 20 });
    
    // Invoice number
    doc.fontSize(12)
       .font('Helvetica')
       .text(`Invoice No: ${invoice.invoiceNumber}`, 400, 100, { align: 'right' });
       
    this.addArabicText(`رقم الفاتورة: ${invoice.invoiceNumber}`, 350, 115);
    
    doc.moveDown(3);
  }

  addCompanyInfo() {
    const { doc } = this;
    
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text(process.env.COMPANY_NAME || 'Your Company Name', 50, 150);
       
    this.addArabicText(process.env.COMPANY_NAME_AR || 'اسم شركتك', 50, 170);
    
    doc.fontSize(10)
       .font('Helvetica')
       .text(process.env.COMPANY_ADDRESS || 'Company Address', 50, 190)
       .text(`Phone: ${process.env.COMPANY_PHONE || '+968-XX-XXXXXX'}`, 50, 205)
       .text(`Email: ${process.env.COMPANY_EMAIL || 'info@company.om'}`, 50, 220);
       
    if (process.env.COMPANY_TRN) {
      doc.text(`Tax Registration No: ${process.env.COMPANY_TRN}`, 50, 235);
    }
  }

  addCustomerInfo(customer) {
    const { doc } = this;
    
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Bill To:', 50, 280);
       
    this.addArabicText('إرسال الفاتورة إلى:', 50, 295);
    
    doc.fontSize(10)
       .font('Helvetica')
       .text(customer.name, 50, 315);
       
    if (customer.nameAr) {
      this.addArabicText(customer.nameAr, 50, 330);
    }
    
    doc.text(customer.email, 50, 345)
       .text(customer.phone || '', 50, 360);
       
    if (customer.address) {
      const address = customer.address;
      doc.text(`${address.street || ''} ${address.city || ''} ${address.state || ''}`, 50, 375);
      doc.text(`${address.postalCode || ''} ${address.country || ''}`, 50, 390);
    }
    
    if (customer.taxRegistrationNumber) {
      doc.text(`Tax Reg. No: ${customer.taxRegistrationNumber}`, 50, 405);
    }
  }

  addInvoiceDetails(invoice) {
    const { doc } = this;
    
    const detailsX = 400;
    let detailsY = 280;
    
    doc.fontSize(10)
       .font('Helvetica')
       .text(`Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, detailsX, detailsY)
       .text(`Due Date: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}`, detailsX, detailsY + 15)
       .text(`Currency: ${invoice.currency}`, detailsX, detailsY + 30);
       
    // Add Hijri date if available
    if (invoice.issueDateHijri) {
      this.addArabicText(`التاريخ الهجري: ${invoice.issueDateHijri}`, detailsX - 50, detailsY + 45);
    }
  }

  addItemsTable(items) {
    const { doc } = this;
    
    const tableTop = 450;
    const itemCodeX = 50;
    const descriptionX = 150;
    const quantityX = 350;
    const priceX = 400;
    const amountX = 480;
    
    // Table header
    doc.fontSize(10)
       .font('Helvetica-Bold');
       
    doc.text('Description', descriptionX, tableTop)
       .text('Qty', quantityX, tableTop)
       .text('Price', priceX, tableTop)
       .text('Amount', amountX, tableTop);
       
    // Header line
    doc.moveTo(50, tableTop + 15)
       .lineTo(550, tableTop + 15)
       .stroke();
    
    // Table rows
    doc.font('Helvetica');
    let currentY = tableTop + 25;
    
    items.forEach((item) => {
      const total = item.quantity * item.unitPrice;
      
      doc.text(item.description, descriptionX, currentY, { width: 180 })
         .text(item.quantity.toFixed(3), quantityX, currentY)
         .text(item.unitPrice.toFixed(3), priceX, currentY)
         .text(total.toFixed(3), amountX, currentY);
         
      // Add Arabic description if available
      if (item.descriptionAr) {
        currentY += 12;
        this.addArabicText(item.descriptionAr, descriptionX, currentY, { width: 180 });
      }
      
      currentY += 20;
      
      // Add new page if needed
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }
    });
    
    // Bottom line
    doc.moveTo(50, currentY)
       .lineTo(550, currentY)
       .stroke();
       
    return currentY + 10;
  }

  addTotals(invoice) {
    const { doc } = this;
    
    const totalsX = 400;
    let totalsY = doc.y + 20;
    
    doc.fontSize(10)
       .font('Helvetica');
       
    // Subtotal
    doc.text('Subtotal:', totalsX, totalsY)
       .text(`${invoice.subtotal.toFixed(3)} ${invoice.currency}`, totalsX + 80, totalsY);
       
    // VAT
    totalsY += 15;
    doc.text('VAT (5%):', totalsX, totalsY)
       .text(`${invoice.vatAmount.toFixed(3)} ${invoice.currency}`, totalsX + 80, totalsY);
       
    // Total line
    totalsY += 10;
    doc.moveTo(totalsX, totalsY)
       .lineTo(550, totalsY)
       .stroke();
       
    // Total
    totalsY += 15;
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Total:', totalsX, totalsY)
       .text(`${invoice.totalAmount.toFixed(3)} ${invoice.currency}`, totalsX + 80, totalsY);
       
    this.addArabicText(`المجموع: ${invoice.totalAmount.toFixed(3)} ${invoice.currency}`, totalsX - 50, totalsY + 20);
  }

  addFooter(invoice) {
    const { doc } = this;
    
    // Notes
    if (invoice.notes) {
      doc.fontSize(10)
         .font('Helvetica')
         .text('Notes:', 50, doc.y + 30);
         
      this.addArabicText(invoice.notes, 50, doc.y + 10, { width: 500 });
    }
    
    // Footer text
    const footerY = doc.page.height - 100;
    
    doc.fontSize(8)
       .font('Helvetica')
       .text('Thank you for your business!', 50, footerY, { align: 'center' });
       
    this.addArabicText('شكراً لتعاملكم معنا', 50, footerY + 15, { align: 'center' });
    
    // QR Code placeholder (if QR code data exists)
    if (invoice.qrCode) {
      doc.text('Scan QR code to verify invoice authenticity', 50, footerY + 40, { align: 'center' });
      // In a real implementation, you would generate and add the QR code here
    }
  }

  // Generate custom report PDF
  async generateReportPDF(reportData, reportType, outputPath) {
    this.createDocument();
    
    // Report header
    this.addReportHeader(reportType, reportData.dateRange);
    
    // Report content based on type
    switch (reportType) {
      case 'sales':
        this.addSalesReportContent(reportData);
        break;
      case 'tax':
        this.addTaxReportContent(reportData);
        break;
      case 'compliance':
        this.addComplianceReportContent(reportData);
        break;
      default:
        this.addGenericReportContent(reportData);
    }
    
    // Report footer
    this.addReportFooter();
    
    this.doc.end();
    
    if (outputPath) {
      this.doc.pipe(fs.createWriteStream(outputPath));
    }
    
    return this.doc;
  }

  addReportHeader(reportType, dateRange) {
    const { doc } = this;
    
    // Company info
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text(process.env.COMPANY_NAME || 'Company Name', 50, 50);
       
    // Report title
    const titles = {
      sales: 'Sales Report',
      tax: 'Tax Report',
      compliance: 'Compliance Report'
    };
    
    doc.fontSize(14)
       .text(titles[reportType] || 'Business Report', 50, 80);
       
    // Date range
    if (dateRange) {
      doc.fontSize(10)
         .font('Helvetica')
         .text(`Period: ${dateRange.start} - ${dateRange.end}`, 50, 105);
    }
    
    // Generated date
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 50, 120);
    
    doc.moveDown(2);
  }

  addSalesReportContent(data) {
    const { doc } = this;
    
    // Summary statistics
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Summary', 50, doc.y + 20);
       
    const summaryY = doc.y + 10;
    doc.fontSize(10)
       .font('Helvetica')
       .text(`Total Sales: ${data.summary.totalSales} OMR`, 50, summaryY)
       .text(`Total Invoices: ${data.summary.totalInvoices}`, 200, summaryY)
       .text(`Average Invoice Value: ${data.summary.averageInvoiceValue} OMR`, 350, summaryY);
    
    // Sales data table
    if (data.salesData && data.salesData.length > 0) {
      this.addDataTable(data.salesData, [
        { key: 'period', header: 'Period', width: 100 },
        { key: 'invoiceCount', header: 'Invoices', width: 80 },
        { key: 'grossSales', header: 'Gross Sales', width: 100, format: 'currency' },
        { key: 'vatAmount', header: 'VAT', width: 80, format: 'currency' },
        { key: 'netSales', header: 'Net Sales', width: 100, format: 'currency' }
      ]);
    }
  }

  addTaxReportContent(data) {
    const { doc } = this;
    
    // Tax summary
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Tax Summary', 50, doc.y + 20);
       
    const summaryY = doc.y + 10;
    doc.fontSize(10)
       .font('Helvetica')
       .text(`Total VAT Collected: ${data.summary.totalVATCollected || 0} OMR`, 50, summaryY)
       .text(`VAT Due: ${data.summary.vatDue || 0} OMR`, 250, summaryY)
       .text(`Corporate Tax Due: ${data.summary.corporateTaxDue || 0} OMR`, 400, summaryY);
    
    // VAT breakdown table
    if (data.vatData && data.vatData.length > 0) {
      this.addDataTable(data.vatData, [
        { key: 'period', header: 'Period', width: 80 },
        { key: 'standardRatedSales', header: 'Standard Sales', width: 100, format: 'currency' },
        { key: 'zeroRatedSales', header: 'Zero Rated', width: 80, format: 'currency' },
        { key: 'exemptSales', header: 'Exempt', width: 80, format: 'currency' },
        { key: 'outputVAT', header: 'Output VAT', width: 80, format: 'currency' },
        { key: 'inputVAT', header: 'Input VAT', width: 80, format: 'currency' },
        { key: 'netVAT', header: 'Net VAT', width: 80, format: 'currency' }
      ]);
    }
  }

  addComplianceReportContent(data) {
    const { doc } = this;
    
    // Compliance summary
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Compliance Overview', 50, doc.y + 20);
       
    const summaryY = doc.y + 10;
    doc.fontSize(10)
       .font('Helvetica')
       .text(`Overall Compliance Rate: ${data.summary.overallCompliance || 0}%`, 50, summaryY)
       .text(`Digital Signature Rate: ${data.summary.digitalSignatureRate || 0}%`, 250, summaryY)
       .text(`PEPPOL Rate: ${data.summary.peppolRate || 0}%`, 400, summaryY);
    
    // Compliance details table
    if (data.complianceData && data.complianceData.length > 0) {
      this.addDataTable(data.complianceData, [
        { key: 'requirement', header: 'Requirement', width: 200 },
        { key: 'compliantItems', header: 'Compliant', width: 80 },
        { key: 'totalItems', header: 'Total', width: 80 },
        { key: 'rate', header: 'Rate (%)', width: 80, format: 'percentage' },
        { key: 'status', header: 'Status', width: 100 }
      ]);
    }
  }

  addDataTable(data, columns) {
    const { doc } = this;
    
    const tableTop = doc.y + 30;
    let currentX = 50;
    
    // Table headers
    doc.fontSize(10)
       .font('Helvetica-Bold');
       
    columns.forEach(col => {
      doc.text(col.header, currentX, tableTop, { width: col.width });
      currentX += col.width;
    });
    
    // Header line
    doc.moveTo(50, tableTop + 15)
       .lineTo(currentX, tableTop + 15)
       .stroke();
    
    // Table rows
    doc.font('Helvetica');
    let currentY = tableTop + 25;
    
    data.forEach(row => {
      currentX = 50;
      
      columns.forEach(col => {
        let value = row[col.key];
        
        // Format value based on type
        if (col.format === 'currency') {
          value = `${parseFloat(value || 0).toFixed(3)} OMR`;
        } else if (col.format === 'percentage') {
          value = `${parseFloat(value || 0).toFixed(1)}%`;
        }
        
        doc.text(String(value || ''), currentX, currentY, { width: col.width });
        currentX += col.width;
      });
      
      currentY += 15;
      
      // Add new page if needed
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }
    });
    
    // Bottom line
    doc.moveTo(50, currentY)
       .lineTo(currentX, currentY)
       .stroke();
       
    doc.y = currentY + 10;
  }

  addReportFooter() {
    const { doc } = this;
    
    const footerY = doc.page.height - 60;
    
    doc.fontSize(8)
       .font('Helvetica')
       .text(`Generated by ${process.env.COMPANY_NAME || 'Oman Invoicing System'}`, 50, footerY)
       .text(`Page ${doc.bufferedPageRange().start + 1}`, 500, footerY);
  }
}

module.exports = PDFGenerator;
