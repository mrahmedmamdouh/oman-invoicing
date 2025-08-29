export const INVOICE_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled'
};

export const CUSTOMER_TYPES = {
  INDIVIDUAL: 'individual',
  BUSINESS: 'business'
};

export const CURRENCIES = {
  OMR: 'OMR', // Oman Rial
  USD: 'USD',
  EUR: 'EUR',
  SAR: 'SAR', // Saudi Riyal
  AED: 'AED', // UAE Dirham
};

export const TAX_RATES = {
  VAT: 0.05, // 5% VAT in Oman
  CORPORATE: 0.15, // 15% Corporate Tax
  WITHHOLDING: 0.10, // 10% Withholding Tax
};

export const PAYMENT_TERMS = [
  { value: 0, label: 'Cash on Delivery', label_ar: 'دفع عند التسليم' },
  { value: 7, label: '7 Days', label_ar: '7 أيام' },
  { value: 15, label: '15 Days', label_ar: '15 يوم' },
  { value: 30, label: '30 Days', label_ar: '30 يوم' },
  { value: 60, label: '60 Days', label_ar: '60 يوم' },
  { value: 90, label: '90 Days', label_ar: '90 يوم' },
];

export const OMAN_GOVERNORATES = [
  { value: 'muscat', label: 'Muscat', label_ar: 'مسقط' },
  { value: 'dhofar', label: 'Dhofar', label_ar: 'ظفار' },
  { value: 'ad_dakhiliyah', label: 'Ad Dakhiliyah', label_ar: 'الداخلية' },
  { value: 'ash_sharqiyah_north', label: 'Ash Sharqiyah North', label_ar: 'شمال الشرقية' },
  { value: 'ash_sharqiyah_south', label: 'Ash Sharqiyah South', label_ar: 'جنوب الشرقية' },
  { value: 'al_batinah_north', label: 'Al Batinah North', label_ar: 'شمال الباطنة' },
  { value: 'al_batinah_south', label: 'Al Batinah South', label_ar: 'جنوب الباطنة' },
  { value: 'al_buraymi', label: 'Al Buraymi', label_ar: 'البريمي' },
  { value: 'ad_dhahirah', label: 'Ad Dhahirah', label_ar: 'الظاهرة' },
  { value: 'al_wusta', label: 'Al Wusta', label_ar: 'الوسطى' },
  { value: 'musandam', label: 'Musandam', label_ar: 'مسندم' },
];

export const UNITS_OF_MEASURE = [
  { value: 'piece', label: 'Piece', label_ar: 'قطعة' },
  { value: 'kg', label: 'Kilogram', label_ar: 'كيلوجرام' },
  { value: 'gram', label: 'Gram', label_ar: 'جرام' },
  { value: 'liter', label: 'Liter', label_ar: 'لتر' },
  { value: 'meter', label: 'Meter', label_ar: 'متر' },
  { value: 'hour', label: 'Hour', label_ar: 'ساعة' },
  { value: 'day', label: 'Day', label_ar: 'يوم' },
  { value: 'month', label: 'Month', label_ar: 'شهر' },
  { value: 'year', label: 'Year', label_ar: 'سنة' },
  { value: 'box', label: 'Box', label_ar: 'صندوق' },
  { value: 'carton', label: 'Carton', label_ar: 'كرتونة' },
  { value: 'bottle', label: 'Bottle', label_ar: 'زجاجة' },
  { value: 'can', label: 'Can', label_ar: 'علبة' },
];

export const API_ENDPOINTS = {
  AUTH: '/auth',
  INVOICES: '/invoices',
  CUSTOMERS: '/customers',
  REPORTS: '/reports',
  TAX: '/tax',
  PEPPOL: '/peppol',
  SETTINGS: '/settings',
};

export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PREFERENCES: 'user_preferences',
  LANGUAGE: 'language',
  THEME: 'theme',
};

export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  ACCOUNTANT: 'accountant',
  USER: 'user',
};

export const PERMISSIONS = {
  CREATE_INVOICE: 'create_invoice',
  EDIT_INVOICE: 'edit_invoice',
  DELETE_INVOICE: 'delete_invoice',
  FINALIZE_INVOICE: 'finalize_invoice',
  VIEW_REPORTS: 'view_reports',
  MANAGE_CUSTOMERS: 'manage_customers',
  MANAGE_SETTINGS: 'manage_settings',
  MANAGE_USERS: 'manage_users',
};
