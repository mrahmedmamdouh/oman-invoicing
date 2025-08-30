const logger = require('../../shared/utils/logger');
const EmailService = require('../../infrastructure/external/EmailService');

class NotificationService {
  constructor() {
    this.emailService = new EmailService();
  }

  async sendInvoiceNotification(type, invoice, customer, options = {}) {
    try {
      switch (type) {
        case 'invoice_created':
          return await this.sendInvoiceCreatedNotification(invoice, customer);
        case 'invoice_sent':
          return await this.sendInvoiceSentNotification(invoice, customer, options.attachments);
        case 'payment_reminder':
          return await this.sendPaymentReminder(invoice, customer);
        case 'payment_received':
          return await this.sendPaymentConfirmation(invoice, customer);
        case 'invoice_overdue':
          return await this.sendOverdueNotification(invoice, customer);
        default:
          throw new Error(`Unknown notification type: ${type}`);
      }
    } catch (error) {
      logger.error('Failed to send notification', {
        type,
        invoiceId: invoice.id,
        customerEmail: customer.email,
        error: error.message
      });
      throw error;
    }
  }

  async sendInvoiceCreatedNotification(invoice, customer) {
    // Internal notification - could be to admin or accounting team
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return;

    const subject = `فاتورة جديدة تم إنشاؤها - New Invoice Created: ${invoice.invoiceNumber}`;
    const content = `
      <h3>تم إنشاء فاتورة جديدة - New Invoice Created</h3>
      <p><strong>رقم الفاتورة:</strong> ${invoice.invoiceNumber}</p>
      <p><strong>العميل:</strong> ${customer.name}</p>
      <p><strong>المبلغ:</strong> ${invoice.totalAmount.toFixed(3)} ${invoice.currency}</p>
      <p><strong>الحالة:</strong> ${invoice.status}</p>
    `;

    // This would be sent to internal team
    return { success: true, type: 'internal_notification' };
  }

  async sendInvoiceSentNotification(invoice, customer, attachments = []) {
    return await this.emailService.sendInvoiceEmail(invoice, customer, attachments);
  }

  async sendPaymentReminder(invoice, customer) {
    return await this.emailService.sendPaymentReminder(invoice, customer);
  }

  async sendPaymentConfirmation(invoice, customer) {
    const subject = `تأكيد استلام الدفع - Payment Confirmation: ${invoice.invoiceNumber}`;
    const content = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head><meta charset="UTF-8"></head>
      <body style="font-family: Arial, sans-serif; direction: rtl;">
        <div style="max-width: 600px; margin: 0 auto;">
          <div style="background: #52c41a; color: white; padding: 20px; text-align: center;">
            <h2>✅ تم استلام الدفع بنجاح</h2>
            <p>Payment Received Successfully</p>
          </div>
          
          <div style="padding: 20px;">
            <p>عزيزي ${customer.name},</p>
            <p>Dear ${customer.name},</p>
            
            <p>نشكركم على سداد الفاتورة رقم <strong>${invoice.invoiceNumber}</strong></p>
            <p>Thank you for your payment of invoice <strong>${invoice.invoiceNumber}</strong></p>
            
            <div style="background: #f6ffed; border: 1px solid #b7eb8f; padding: 15px; margin: 20px 0; border-radius: 6px;">
              <p><strong>المبلغ المدفوع:</strong> ${invoice.totalAmount.toFixed(3)} ${invoice.currency}</p>
              <p><strong>تاريخ الدفع:</strong> ${new Date().toLocaleDateString('ar-OM')}</p>
              <p><strong>حالة الفاتورة:</strong> مدفوع - Paid</p>
            </div>
            
            <p>تم تحديث حسابكم وسجلاتنا المالية.</p>
            <p>Your account and our financial records have been updated.</p>
            
            <p>نشكركم لثقتكم بنا.</p>
            <p>Thank you for your business.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Implementation would use email service
    return { success: true, subject, content };
  }

  async sendOverdueNotification(invoice, customer) {
    const daysOverdue = Math.ceil((new Date() - new Date(invoice.dueDate)) / (1000 * 60 * 60 * 24));
    
    const subject = `⚠️ فاتورة متأخرة ${daysOverdue} يوم - Overdue Invoice: ${invoice.invoiceNumber}`;
    const content = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head><meta charset="UTF-8"></head>
      <body style="font-family: Arial, sans-serif; direction: rtl;">
        <div style="max-width: 600px; margin: 0 auto;">
          <div style="background: #ff7875; color: white; padding: 20px; text-align: center;">
            <h2>⚠️ تنبيه: فاتورة متأخرة</h2>
            <p>URGENT: Overdue Invoice Notice</p>
          </div>
          
          <div style="padding: 20px;">
            <div style="background: #fff2e8; border: 2px solid #ffa940; padding: 20px; margin: 20px 0; border-radius: 8px;">
              <h3 style="color: #d46b08;">فاتورة متأخرة ${daysOverdue} يوم</h3>
              <p><strong>رقم الفاتورة:</strong> ${invoice.invoiceNumber}</p>
              <p><strong>المبلغ المستحق:</strong> ${invoice.totalAmount.toFixed(3)} ${invoice.currency}</p>
              <p><strong>تاريخ الاستحقاق:</strong> ${new Date(invoice.dueDate).toLocaleDateString('ar-OM')}</p>
            </div>
            
            <p>يُرجى ترتيب السداد فوراً لتجنب:</p>
            <ul>
              <li>رسوم التأخير</li>
              <li>إيقاف الخدمات</li>
              <li>الإجراءات القانونية</li>
            </ul>
            
            <p>Please arrange immediate payment to avoid:</p>
            <ul>
              <li>Late payment charges</li>
              <li>Service suspension</li>
              <li>Legal action</li>
            </ul>
          </div>
        </div>
      </body>
      </html>
    `;

    return { success: true, subject, content, urgent: true };
  }

  // System notifications
  async sendSystemAlert(alertType, details) {
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').filter(Boolean);
    if (!adminEmails.length) return;

    const alerts = {
      'high_error_rate': {
        subject: '🚨 تنبيه النظام: معدل أخطاء عالي - High Error Rate Alert',
        priority: 'high'
      },
      'database_connection_failed': {
        subject: '🚨 تنبيه النظام: فشل الاتصال بقاعدة البيانات - Database Connection Failed',
        priority: 'critical'
      },
      'disk_space_low': {
        subject: '⚠️ تنبيه النظام: مساحة القرص منخفضة - Low Disk Space',
        priority: 'medium'
      },
      'certificate_expiring': {
        subject: '📋 تنبيه النظام: انتهاء صلاحية الشهادة قريباً - Certificate Expiring Soon',
        priority: 'high'
      }
    };

    const alert = alerts[alertType];
    if (!alert) return;

    logger.warn('System alert triggered', { alertType, details });
    
    // In a real implementation, this would send emails to admin team
    return { success: true, alertType, priority: alert.priority, details };
  }

  // Bulk notifications
  async sendBulkNotifications(notifications) {
    const results = [];
    
    for (const notification of notifications) {
      try {
        const result = await this.sendInvoiceNotification(
          notification.type,
          notification.invoice,
          notification.customer,
          notification.options
        );
        results.push({ ...notification, success: true, result });
      } catch (error) {
        results.push({ 
          ...notification, 
          success: false, 
          error: error.message 
        });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    logger.info('Bulk notifications processed', { total: results.length, successful, failed });

    return { total: results.length, successful, failed, details: results };
  }
}

module.exports = NotificationService;
