const PDFDocument = require('pdfkit');
const fs = require('fs').promises;
const path = require('path');
const QRCode = require('qrcode');

class PDFService {
  constructor() {
    this.logoPath = path.join(__dirname, '../../../assets/oman-logo.png');
  }

  async generateInvoicePDF(invoice, customer) {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
          bufferPages: true,
          autoFirstPage: false
        });

        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        doc.addPage();

        // Add content to PDF
        await this.addHeader(doc, invoice);
        this.addInvoiceDetails(doc, invoice, customer);
        this.addItemsTable(doc, invoice);
        this.addTotals(doc, invoice);
        await this.addQRCode(doc, invoice);
        this.addFooter(doc, invoice);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  async addHeader(doc, invoice) {
    // Company header
    doc.fontSize(24)
       .fillColor('#C8102E')
       .text('نظام الفوترة العُماني', 50, 50, { align: 'right' });
    
    doc.fontSize(16)
       .fillColor('#009639')
       .text('Oman Invoicing System', 50, 80, { align: 'right' });

    // Oman flag colors line
    doc.rect(50, 110, 510, 3)
       .fillColor('#C8102E')
       .fill();
    
    doc.rect(50, 113, 510, 3)
       .fillColor('#FFFFFF')
       .fill();
    
    doc.rect(50, 116, 510, 3)
       .fillColor('#009639')
       .fill();

    // Invoice title
    doc.fontSize(20)
       .fillColor('#000000')
       .text('فــاتــورة - INVOICE', 50, 140, { align: 'center' });
  }

  addInvoiceDetails(doc, invoice, customer) {
    const startY = 180;
    
    // Invoice details (right side)
    doc.fontSize(12)
       .fillColor('#000000')
       .text(`رقم الفاتورة: ${invoice.invoiceNumber}`, 350, startY)
       .text(`Invoice Number: ${invoice.invoiceNumber}`, 350, startY + 15)
       
       .text(`التاريخ: ${new Date(invoice.issueDate).toLocaleDateString('ar-OM')}`, 350, startY + 40)
       .text(`Date: ${new Date(invoice.issueDate).toLocaleDateString('en-US')}`, 350, startY + 55)
       
       .text(`تاريخ الاستحقاق: ${new Date(invoice.dueDate).toLocaleDateString('ar-OM')}`, 350, startY + 80)
       .text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString('en-US')}`, 350, startY + 95);

    // Customer details (left side)
    doc.text('فاتورة إلى:', 50, startY)
       .text('Bill To:', 50, startY + 15)
       .text(customer.name, 50, startY + 35)
       .text(customer.nameAr || '', 50, startY + 50)
       .text(customer.email, 50, startY + 65)
       .text(customer.phone, 50, startY + 80);

    if (customer.address) {
      doc.text(`${customer.address.street}, ${customer.address.city}`, 50, startY + 95)
         .text(`${customer.address.country} ${customer.address.postalCode}`, 50, startY + 110);
    }
  }

  addItemsTable(doc, invoice) {
    const tableTop = 320;
    const itemHeight = 25;
    
    // Table headers
    doc.fontSize(10)
       .fillColor('#ffffff')
       .rect(50, tableTop, 510, 25)
       .fillColor('#C8102E')
       .fill()
       .fillColor('#ffffff')
       .text('البند', 60, tableTop + 8)
       .text('الكمية', 200, tableTop + 8)
       .text('السعر', 260, tableTop + 8)
       .text('الإجمالي', 320, tableTop + 8)
       .text('Description', 380, tableTop + 8);

    // Table rows
    let currentY = tableTop + itemHeight;
    
    invoice.items.forEach((item, index) => {
      const isEven = index % 2 === 0;
      
      // Alternate row colors
      if (isEven) {
        doc.rect(50, currentY, 510, itemHeight)
           .fillColor('#f8f9fa')
           .fill();
      }

      doc.fontSize(9)
         .fillColor('#000000')
         .text(item.description, 60, currentY + 8, { width: 130 })
         .text(item.quantity.toString(), 200, currentY + 8)
         .text(`${item.unitPrice.toFixed(3)}`, 260, currentY + 8)
         .text(`${item.total.toFixed(3)}`, 320, currentY + 8)
         .text(item.descriptionAr || '', 380, currentY + 8, { width: 130 });

      currentY += itemHeight;
    });

    return currentY;
  }

  addTotals(doc, invoice) {
    const totalsY = 520;
    
    // Totals box
    doc.rect(350, totalsY, 210, 100)
       .stroke('#C8102E');

    doc.fontSize(11)
       .fillColor('#000000')
       .text('الإجمالي الفرعي:', 360, totalsY + 15)
       .text('Subtotal:', 360, totalsY + 30)
       .text(`${invoice.subtotal.toFixed(3)} ${invoice.currency}`, 480, totalsY + 22, { align: 'right' })

       .text('ضريبة القيمة المضافة (5%):', 360, totalsY + 45)
       .text('VAT (5%):', 360, totalsY + 60)
       .text(`${invoice.vatAmount.toFixed(3)} ${invoice.currency}`, 480, totalsY + 52, { align: 'right' });

    // Total line
    doc.rect(350, totalsY + 70, 210, 1)
       .fillColor('#C8102E')
       .fill();

    doc.fontSize(13)
       .fillColor('#C8102E')
       .text('الإجمالي:', 360, totalsY + 80)
       .text('Total:', 360, totalsY + 95)
       .text(`${invoice.totalAmount.toFixed(3)} ${invoice.currency}`, 480, totalsY + 87, { 
         align: 'right',
         fontWeight: 'bold'
       });
  }

  async addQRCode(doc, invoice) {
    try {
      const qrData = {
        invoiceNumber: invoice.invoiceNumber,
        totalAmount: invoice.totalAmount.toFixed(3),
        vatAmount: invoice.vatAmount.toFixed(3),
        issueDate: invoice.issueDate.toISOString(),
        currency: invoice.currency
      };

      const qrString = JSON.stringify(qrData);
      const qrBuffer = await QRCode.toBuffer(qrString, {
        width: 100,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      doc.image(qrBuffer, 70, 650, { width: 80 });
      
      doc.fontSize(8)
         .text('QR Code للتحقق', 70, 740)
         .text('Scan to verify', 70, 750);

    } catch (error) {
      console.error('QR Code generation failed:', error);
    }
  }

  addFooter(doc, invoice) {
    doc.fontSize(8)
       .fillColor('#666666')
       .text('هذه الفاتورة موقعة رقمياً وتتوافق مع متطلبات هيئة الضرائب العُمانية', 50, 770, { align: 'center' })
       .text('This invoice is digitally signed and complies with Oman Tax Authority requirements', 50, 780, { align: 'center' })
       
       .text(`الرقم الضريبي: ${invoice.taxRegistrationNumber}`, 50, 800)
       .text(`السجل التجاري: ${invoice.commercialRegistrationNumber}`, 300, 800);
  }
}

module.exports = PDFService;
