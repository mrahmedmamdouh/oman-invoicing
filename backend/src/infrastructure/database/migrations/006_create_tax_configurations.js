exports.up = function(knex) {
  return knex.schema.createTable('tax_configurations', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('country', 2).defaultTo('OM');
    table.decimal('vat_rate', 5, 4).defaultTo(0.05);
    table.decimal('corporate_tax_rate', 5, 4).defaultTo(0.15);
    table.decimal('exemption_threshold', 15, 3).defaultTo(38500);
    table.date('effective_from').notNullable();
    table.date('effective_to');
    table.boolean('is_active').defaultTo(true);
    table.string('ota_api_endpoint');
    table.string('ota_api_key');
    table.enum('reporting_frequency', ['monthly', 'quarterly', 'annually']).defaultTo('quarterly');
    table.timestamps(true, true);
    
    // Indexes
    table.index(['country', 'is_active']);
    table.index(['effective_from', 'effective_to']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('tax_configurations');
};