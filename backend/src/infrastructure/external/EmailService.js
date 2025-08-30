const nodemailer = require('nodemailer');
const logger = require('../../shared/utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'localhost',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  async sendInvoiceEmail(invoice, customer, attachments = []) {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: customer.email,
        subject: `فاتورة رقم ${invoice.invoiceNumber} - Invoice ${invoice.invoiceNumber}`,
        html: this.generateInvoiceEmailTemplate(invoice, customer),
        attachments
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      logger.info('Invoice email sent successfully', {
        invoiceId: invoice.id,
        customerEmail: customer.email,
        messageId: result.messageId
      });
      
      return {
        success: true,
        messageId: result.messageId,
        sentAt: new Date()
      };
    } catch (error) {
      logger.error('Failed to send invoice email', {
        error: error.message,
        invoiceId: invoice.id,
        customerEmail: customer.email
      });
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }

  generateInvoiceEmailTemplate(invoice, customer) {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>فاتورة - Invoice</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            direction: rtl;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #C8102E, #009639);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .content {
            padding: 30px 20px;
          }
          .invoice-details {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            border-right: 4px solid #C8102E;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            border-top: 1px solid #eee;
          }
          .oman-flag {
            display: inline-block;
            width: 30px;
            height: 20px;
            background: linear-gradient(to bottom, #C8102E 33%, white 33%, white 66%, #009639 66%);
            margin-left: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="oman-flag"></div>
            <h1>فاتورة جديدة</h1>
            <p>New Invoice from Oman Invoicing System</p>
          </div>
          
          <div class="content">
            <p>عزيزي ${customer.name},</p>
            <p>Dear ${customer.name},</p>
            
            <p>يُرجى العلم بأنه تم إصدار فاتورة جديدة لحسابكم:</p>
            <p>Please find below details of your new invoice:</p>
            
            <div class="invoice-details">
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #ddd;">
                  <td style="padding: 10px; font-weight: bold;">رقم الفاتورة / Invoice Number:</td>
                  <td style="padding: 10px; text-align: left; direction: ltr;">${invoice.invoiceNumber}</td>
                </tr>
                <tr style="border-bottom: 1px solid #ddd;">
                  <td style="padding: 10px; font-weight: bold;">التاريخ / Date:</td>
                  <td style="padding: 10px; text-align: left;">${new Date(invoice.issueDate).toLocaleDateString('ar-OM')}</td>
                </tr>
                <tr style="border-bottom: 1px solid #ddd;">
                  <td style="padding: 10px; font-weight: bold;">تاريخ الاستحقاق / Due Date:</td>
                  <td style="padding: 10px; text-align: left;">${new Date(invoice.dueDate).toLocaleDateString('ar-OM')}</td>
                </tr>
                <tr style="border-bottom: 1px solid #ddd;">
                  <td style="padding: 10px; font-weight: bold;">المبلغ الإجمالي / Total Amount:</td>
                  <td style="padding: 10px; text-align: left; font-size: 18px; font-weight: bold; color: #C8102E;">
                    ${invoice.totalAmount.toFixed(3)} ${invoice.currency}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px; font-weight: bold;">ضريبة القيمة المضافة / VAT:</td>
                  <td style="padding: 10px; text-align: left;">${invoice.vatAmount.toFixed(3)} ${invoice.currency}</td>
                </tr>
              </table>
            </div>
            
            <p>يمكنكم تحميل الفاتورة من المرفقات أو زيارة نظام الفوترة الإلكتروني.</p>
            <p>You can download the invoice from the attachments or visit our online invoicing system.</p>
            
            <p>نشكركم لثقتكم بنا ونتطلع للتعامل معكم مستقبلاً.</p>
            <p>Thank you for your business and we look forward to serving you again.</p>
          </div>
          
          <div class="footer">
            <p>هذه رسالة تلقائية من نظام الفوترة العُماني</p>
            <p>This is an automated message from Oman Invoicing System</p>
            <small>يُرجى عدم الرد على هذه الرسالة - Please do not reply to this email</small>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendPaymentReminder(invoice, customer) {
    const daysOverdue = Math.ceil((new Date() - new Date(invoice.dueDate)) / (1000 * 60 * 60 * 24));
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: customer.email,
      subject: `تذكير دفع - Payment Reminder - فاتورة ${invoice.invoiceNumber}`,
      html: this.generatePaymentReminderTemplate(invoice, customer, daysOverdue)
    };

    return await this.transporter.sendMail(mailOptions);
  }

  generatePaymentReminderTemplate(invoice, customer, daysOverdue) {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .urgent { background: #ffe6e6; border: 2px solid #ff4d4f; padding: 20px; margin: 20px; border-radius: 8px; }
          .amount { font-size: 24px; font-weight: bold; color: #C8102E; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="urgent">
            <h2 style="color: #ff4d4f;">⚠️ تذكير دفع مهم - Important Payment Reminder</h2>
            
            <p>عزيزي ${customer.name},</p>
            <p>Dear ${customer.name},</p>
            
            <p>نود تذكيركم بأن الفاتورة التالية متأخرة السداد بـ <strong>${daysOverdue}</strong> يوماً:</p>
            <p>We would like to remind you that the following invoice is <strong>${daysOverdue}</strong> days overdue:</p>
            
            <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">رقم الفاتورة:</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${invoice.invoiceNumber}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">تاريخ الاستحقاق:</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${new Date(invoice.dueDate).toLocaleDateString('ar-OM')}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">المبلغ المستحق:</td>
                <td style="padding: 10px; border: 1px solid #ddd;" class="amount">${invoice.totalAmount.toFixed(3)} ${invoice.currency}</td>
              </tr>
            </table>
            
            <p>يُرجى ترتيب الدفع في أقرب وقت ممكن لتجنب أي رسوم إضافية.</p>
            <p>Please arrange payment as soon as possible to avoid additional charges.</p>
            
            <p>إذا كنتم قد سددتم المبلغ، يُرجى تجاهل هذه الرسالة.</p>
            <p>If you have already made the payment, please disregard this notice.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = EmailService;
