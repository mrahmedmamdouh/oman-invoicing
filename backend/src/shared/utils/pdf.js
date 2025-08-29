const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const moment = require('moment');
const momentHijri = require('moment-hijri');

class PDFGenerator {
  constructor() {
    this.doc = null;
  }

  async generateInvoicePDF(invoice, customer) {
    this.doc = new PDFDocument({ 
      size: 'A4',
      margin: 50,
      bufferPages: true
    });

    // Set RTL support (basic implementation)
    this.doc.font('Helvetica');
    
    const chunks = [];
    this.doc.on('data', chunk => chunks.push(chunk));
    
    return new Promise((resolve, reject) => {
      this.doc.on('end', () => resolve(Buffer.concat(chunks)));
      this.doc.on('error', reject);
      
      this.buildInvoicePDF(invoice, customer);
      this.doc.end();
    });
  }

  buildInvoicePDF(invoice, customer) {
    // Header
    this.doc.fontSize(20)
           .text('فاتورة - INVOICE', 50, 50, { align: 'center' });
    
    // Invoice details
    this.doc.fontSize(12);
    
    // Company info (left side)
    this.doc.text('Company Information:', 50, 100);
    this.doc.text(`Tax Registration Number: ${invoice.taxRegistrationNumber}`, 50, 120);
    this.doc.text(`Commercial Registration: ${invoice.commercialRegistrationNumber}`, 50, 135);
    
    // Invoice info (right side)
    this.doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 350, 100);
    this.doc.text(`Date: ${moment(invoice.issueDate).format('DD/MM/YYYY')}`, 350, 115);
    this.doc.text(`Due Date: ${moment(invoice.dueDate).format('DD/MM/YYYY')}`, 350, 130);
    this.doc.text(`Hijri Date: ${invoice.issueDateHijri}`, 350, 145);
    
    // Customer info
    this.doc.text('Bill To:', 50, 180);
    this.doc.text(customer.name, 50, 195);
    if (customer.nameAr) {
      this.doc.text(customer.nameAr, 50, 210);
    }
    this.doc.text(customer.email, 50, 225);
    this.doc.text(customer.phone, 50, 240);
    
    // Items table
    const tableTop = 280;
    this.generateItemsTable(invoice, tableTop);
    
    // Totals
    const totalsTop = tableTop + 50 + (invoice.items.length * 20);
    this.generateTotalsSection(invoice, totalsTop);
    
    // QR Code
    if (invoice.qrCode) {
      this.addQRCode(invoice.qrCode, 400, totalsTop + 100);
    }
    
    // Footer
    this.doc.fontSize(8)
           .text('This invoice is digitally signed and complies with Oman Tax Authority requirements', 
                 50, 750, { align: 'center' });
  }

  generateItemsTable(invoice, startY) {
    const tableHeaders = ['Description', 'وصف البند', 'Qty', 'Price', 'Total'];
    const colWidths = [120, 120, 60, 80, 80];
    let currentY = startY;
    
    // Headers
    let currentX = 50;
    tableHeaders.forEach((header, i) => {
      this.doc.text(header, currentX, currentY, { width: colWidths[i] });
      currentX += colWidths[i];
    });
    
    currentY += 20;
    
    // Items
    invoice.items.forEach(item => {
      currentX = 50;
      const itemData = [
        item.description,
        item.descriptionAr || '',
        item.quantity.toString(),
        `${item.unitPrice.toFixed(3)} ${invoice.currency}`,
        `${item.total.toFixed(3)} ${invoice.currency}`
      ];
      
      itemData.forEach((data, i) => {
        this.doc.text(data, currentX, currentY, { width: colWidths[i] });
        currentX += colWidths[i];
      });
      
      currentY += 20;
    });
  }

  generateTotalsSection(invoice, startY) {
    const totalsData = [
      ['Subtotal:', `${invoice.subtotal.toFixed(3)} ${invoice.currency}`],
      ['VAT (5%):', `${invoice.vatAmount.toFixed(3)} ${invoice.currency}`],
      ['Total:', `${invoice.totalAmount.toFixed(3)} ${invoice.currency}`]
    ];
    
    let currentY = startY;
    
    totalsData.forEach(([label, value], index) => {
      const fontSize = index === totalsData.length - 1 ? 14 : 12;
      const fontWeight = index === totalsData.length - 1 ? 'bold' : 'normal';
      
      this.doc.fontSize(fontSize);
      this.doc.text(label, 350, currentY);
      this.doc.text(value, 450, currentY);
      currentY += 20;
    });
  }

  async addQRCode(qrCodeData, x, y) {
    try {
      const qrBuffer = await QRCode.toBuffer(qrCodeData, { width: 100 });
      this.doc.image(qrBuffer, x, y, { width: 100 });
    } catch (error) {
      console.error('Failed to add QR code to PDF:', error);
    }
  }
}

module.exports = PDFGenerator;
