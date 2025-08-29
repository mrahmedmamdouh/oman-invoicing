import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'ar', // Arabic as default for Oman
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    react: {
      useSuspense: false,
    },
    
    resources: {
      ar: {
        translation: {
          // Navigation
          dashboard: 'لوحة التحكم',
          invoices: 'الفواتير',
          customers: 'العملاء',
          reports: 'التقارير',
          settings: 'الإعدادات',
          
          // Common actions
          create: 'إنشاء',
          edit: 'تعديل',
          delete: 'حذف',
          save: 'حفظ',
          cancel: 'إلغاء',
          submit: 'إرسال',
          search: 'بحث',
          filter: 'تصفية',
          export: 'تصدير',
          print: 'طباعة',
          
          // Invoice specific
          'invoice.create': 'إنشاء فاتورة جديدة',
          'invoice.number': 'رقم الفاتورة',
          'invoice.date': 'تاريخ الفاتورة',
          'invoice.dueDate': 'تاريخ الاستحقاق',
          'invoice.customer': 'العميل',
          'invoice.amount': 'المبلغ',
          'invoice.status': 'الحالة',
          'invoice.vat': 'ضريبة القيمة المضافة',
          'invoice.total': 'المجموع',
          
          // Customer specific
          'customer.name': 'اسم العميل',
          'customer.email': 'البريد الإلكتروني',
          'customer.phone': 'رقم الهاتف',
          'customer.address': 'العنوان',
          'customer.taxNumber': 'الرقم الضريبي',
          'customer.commercialNumber': 'رقم السجل التجاري',
          
          // Tax and compliance
          'tax.vat': 'ضريبة القيمة المضافة (5%)',
          'tax.corporate': 'ضريبة الشركات (15%)',
          'tax.exempt': 'معفى من الضريبة',
          'compliance.digitalSignature': 'التوقيع الرقمي',
          'compliance.peppol': 'شبكة PEPPOL',
          'compliance.qrCode': 'رمز QR',
          
          // Messages
          'success.invoiceCreated': 'تم إنشاء الفاتورة بنجاح',
          'success.invoiceSent': 'تم إرسال الفاتورة بنجاح',
          'error.general': 'حدث خطأ، يرجى المحاولة مرة أخرى',
          'error.network': 'خطأ في الاتصال بالشبكة',
          
          // Status
          'status.draft': 'مسودة',
          'status.sent': 'مُرسل',
          'status.paid': 'مدفوع',
          'status.overdue': 'متأخر',
          'status.cancelled': 'ملغى',
        }
      },
      en: {
        translation: {
          // Navigation
          dashboard: 'Dashboard',
          invoices: 'Invoices',
          customers: 'Customers',
          reports: 'Reports',
          settings: 'Settings',
          
          // Common actions
          create: 'Create',
          edit: 'Edit',
          delete: 'Delete',
          save: 'Save',
          cancel: 'Cancel',
          submit: 'Submit',
          search: 'Search',
          filter: 'Filter',
          export: 'Export',
          print: 'Print',
          
          // Invoice specific
          'invoice.create': 'Create New Invoice',
          'invoice.number': 'Invoice Number',
          'invoice.date': 'Invoice Date',
          'invoice.dueDate': 'Due Date',
          'invoice.customer': 'Customer',
          'invoice.amount': 'Amount',
          'invoice.status': 'Status',
          'invoice.vat': 'VAT',
          'invoice.total': 'Total',
          
          // Customer specific
          'customer.name': 'Customer Name',
          'customer.email': 'Email',
          'customer.phone': 'Phone',
          'customer.address': 'Address',
          'customer.taxNumber': 'Tax Registration Number',
          'customer.commercialNumber': 'Commercial Registration Number',
          
          // Tax and compliance
          'tax.vat': 'Value Added Tax (5%)',
          'tax.corporate': 'Corporate Tax (15%)',
          'tax.exempt': 'Tax Exempt',
          'compliance.digitalSignature': 'Digital Signature',
          'compliance.peppol': 'PEPPOL Network',
          'compliance.qrCode': 'QR Code',
          
          // Messages
          'success.invoiceCreated': 'Invoice created successfully',
          'success.invoiceSent': 'Invoice sent successfully',
          'error.general': 'An error occurred, please try again',
          'error.network': 'Network connection error',
          
          // Status
          'status.draft': 'Draft',
          'status.sent': 'Sent',
          'status.paid': 'Paid',
          'status.overdue': 'Overdue',
          'status.cancelled': 'Cancelled',
        }
      }
    }
  });

export default i18n;
