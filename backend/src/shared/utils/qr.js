const QRCode = require('qrcode');

class QRCodeGenerator {
  async generateInvoiceQR(invoice) {
    const qrData = {
      seller: process.env.COMPANY_NAME || 'Your Company',
      vatNumber: invoice.taxRegistrationNumber,
      timestamp: invoice.issueDate.toISOString(),
      totalAmount: invoice.totalAmount.toFixed(3),
      vatAmount: invoice.vatAmount.toFixed(3),
      invoiceNumber: invoice.invoiceNumber
    };

    // Format as per Oman requirements (simplified)
    const qrString = `${qrData.seller}|${qrData.vatNumber}|${qrData.timestamp}|${qrData.totalAmount}|${qrData.vatAmount}`;
    
    return await QRCode.toDataURL(qrString, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      width: 256,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
  }

  async generateQRBuffer(data) {
    return await QRCode.toBuffer(data, {
      errorCorrectionLevel: 'M',
      width: 200
    });
  }

  async generateQRSVG(data) {
    return await QRCode.toString(data, {
      type: 'svg',
      errorCorrectionLevel: 'M',
      width: 200
    });
  }
}

module.exports = new QRCodeGenerator();
