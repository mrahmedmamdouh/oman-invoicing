exports.seed = async function(knex) {
  await knex('tax_configurations').del();

  await knex('tax_configurations').insert([
    {
      country: 'OM',
      vat_rate: 0.05,
      corporate_tax_rate: 0.15,
      exemption_threshold: 38500.000,
      effective_from: '2021-04-16', // When VAT was introduced in Oman
      is_active: true,
      reporting_frequency: 'quarterly'
    }
  ]);
};