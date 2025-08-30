const EmailService = require('../../infrastructure/external/EmailService');
const PDFService = require('../../infrastructure/external/PDFService');
const logger = require('./logger');

const emailService = new EmailService();
const pdfService = new PDFService();

class EmailUtils {
  async sendInvoiceWithAttachment(invoice, customer) {
    try {
      // Generate PDF
      const pdfBuffer = await pdfService.generateInvoicePDF(invoice, customer);
      
      // Prepare attachment
      const attachments = [
        {
          filename: `invoice-${invoice.invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ];

      // Send email
      const result = await emailService.sendInvoiceEmail(invoice, customer, attachments);
      
      logger.info('Invoice email sent with PDF attachment', {
        invoiceId: invoice.id,
        customerEmail: customer.email,
        pdfSize: pdfBuffer.length
      });

      return result;
    } catch (error) {
      logger.error('Failed to send invoice with attachment', {
        invoiceId: invoice.id,
        error: error.message
      });
      throw error;
    }
  }

  async sendBulkPaymentReminders(overdueInvoices) {
    const results = [];

    for (const { invoice, customer } of overdueInvoices) {
      try {
        const result = await emailService.sendPaymentReminder(invoice, customer);
        results.push({ invoiceId: invoice.id, success: true, result });
      } catch (error) {
        results.push({ 
          invoiceId: invoice.id, 
          success: false, 
          error: error.message 
        });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    logger.info('Bulk payment reminders sent', { 
      total: results.length, 
      successful, 
      failed 
    });

    return { total: results.length, successful, failed, details: results };
  }

  generateWelcomeEmail(user) {
    return {
      to: user.email,
      subject: 'مرحباً بك في نظام الفوترة العُماني - Welcome to Oman Invoicing',
      html: `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; direction: rtl; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: #C8102E; color: white; padding: 20px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>مرحباً ${user.fullName}</h1>
              <p>Welcome to Oman Invoicing System</p>
            </div>
            <div style="padding: 20px;">
              <p>تم إنشاء حسابك بنجاح في نظام الفوترة العُماني.</p>
              <p>Your account has been successfully created.</p>
              
              <p>يمكنك الآن:</p>
              <ul>
                <li>إنشاء وإدارة الفواتير</li>
                <li>إدارة بيانات العملاء</li>
                <li>إنشاء التقارير</li>
                <li>التوافق مع متطلبات هيئة الضرائب العُمانية</li>
              </ul>
              
              <p>You can now:</p>
              <ul>
                <li>Create and manage invoices</li>
                <li>Manage customer data</li>
                <li>Generate reports</li>
                <li>Comply with Oman Tax Authority requirements</li>
              </ul>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }
}

module.exports = new EmailUtils();
