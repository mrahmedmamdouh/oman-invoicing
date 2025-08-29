const nodemailer = require('nodemailer');
const logger = require('../../shared/utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }

  async sendInvoice(invoice, customer, attachments = []) {
    try {
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: customer.email,
        subject: `فاتورة رقم ${invoice.invoiceNumber} - Invoice ${invoice.invoiceNumber}`,
        html: this.generateInvoiceEmail(invoice, customer),
        attachments
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      logger.info('Invoice email sent', { 
        invoiceId: invoice.id, 
        customerEmail: customer.email,
        messageId: result.messageId 
      });
      
      return result;
    } catch (error) {
      logger.error('Failed to send invoice email', { 
        error: error.message,
        invoiceId: invoice.id 
      });
      throw error;
    }
  }

  generateInvoiceEmail(invoice, customer) {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Arial', sans-serif; direction: rtl; }
          .header { background: #C8102E; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .footer { background: #f5f5f5; padding: 15px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>فاتورة جديدة - New Invoice</h2>
        </div>
        <div class="content">
          <p>عزيزي ${customer.name},</p>
          <p>Dear ${customer.nameEn || customer.name},</p>
          
          <p>يُرجى العلم بأنه تم إصدار فاتورة جديدة:</p>
          <p>Please note that a new invoice has been issued:</p>
          
          <ul style="list-style: none; padding: 0;">
            <li><strong>رقم الفاتورة / Invoice Number:</strong> ${invoice.invoiceNumber}</li>
            <li><strong>التاريخ / Date:</strong> ${new Date(invoice.issueDate).toLocaleDateString('ar-OM')}</li>
            <li><strong>المبلغ / Amount:</strong> ${invoice.totalAmount.toFixed(3)} OMR</li>
            <li><strong>تاريخ الاستحقاق / Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString('ar-OM')}</li>
          </ul>
          
          <p>نشكركم لثقتكم بنا.</p>
          <p>Thank you for your business.</p>
        </div>
        <div class="footer">
          <p>هذه رسالة تلقائية، يُرجى عدم الرد عليها</p>
          <p>This is an automated message, please do not reply</p>
        </div>
      </body>
      </html>
    `;
  }

  async sendWelcomeEmail(user) {
    try {
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: user.email,
        subject: 'مرحباً بك في نظام الفوترة العُماني - Welcome to Oman Invoicing System',
        html: `
          <h2>مرحباً ${user.fullName}</h2>
          <p>تم إنشاء حسابك بنجاح في نظام الفوترة العُماني.</p>
          <p>Your account has been successfully created in the Oman Invoicing System.</p>
        `
      };

      return await this.transporter.sendMail(mailOptions);
    } catch (error) {
      logger.error('Failed to send welcome email', { error: error.message, userId: user.id });
      throw error;
    }
  }
}

module.exports = EmailService;
