exports.seed = async function(knex) {
  await knex('customers').del();

  await knex('customers').insert([
    {
      name: 'شركة عمان للتجارة المحدودة',
      name_ar: 'شركة عمان للتجارة المحدودة',
      email: 'info@omantrading.om',
      phone: '+968 24 123456',
      tax_registration_number: '123456789012345',
      commercial_registration_number: '12345678',
      customer_type: 'business',
      street: 'شارع السلطان قابوس',
      street_ar: 'شارع السلطان قابوس',
      city: 'مسقط',
      city_ar: 'مسقط',
      state: 'مسقط',
      state_ar: 'مسقط',
      postal_code: '100',
      country: 'OM',
      country_ar: 'عُمان',
      payment_terms: 30,
      currency: 'OMR',
      is_active: true
    },
    {
      name: 'مؤسسة الخليج التجارية',
      name_ar: 'مؤسسة الخليج التجارية',
      email: 'contact@gulf-trading.om',
      phone: '+968 23 987654',
      tax_registration_number: '987654321098765',
      commercial_registration_number: '87654321',
      customer_type: 'business',
      street: 'شارع صلالة',
      street_ar: 'شارع صلالة',
      city: 'صلالة',
      city_ar: 'صلالة',
      state: 'ظفار',
      state_ar: 'ظفار',
      postal_code: '211',
      country: 'OM',
      country_ar: 'عُمان',
      payment_terms: 15,
      currency: 'OMR',
      is_active: true
    }
  ]);
};
