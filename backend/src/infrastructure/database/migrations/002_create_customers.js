exports.up = function(knex) {
  return knex.schema.createTable('customers', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.string('name_ar'); // Arabic name
    table.string('email');
    table.string('phone');
    table.string('tax_registration_number');
    table.string('commercial_registration_number');
    table.string('peppol_id');
    
    // Address fields
    table.string('street');
    table.string('street_ar');
    table.string('city');
    table.string('city_ar');
    table.string('state');
    table.string('state_ar');
    table.string('postal_code');
    table.string('country').defaultTo('OM');
    table.string('country_ar').defaultTo('عُمان');
    
    table.enum('customer_type', ['individual', 'business']).defaultTo('individual');
    table.decimal('credit_limit', 15, 3).defaultTo(0);
    table.integer('payment_terms').defaultTo(30); // days
    table.string('currency', 3).defaultTo('OMR');
    table.boolean('is_active').defaultTo(true);
    table.uuid('created_by').references('id').inTable('users');
    table.timestamps(true, true);
    
    // Indexes
    table.index(['email']);
    table.index(['tax_registration_number']);
    table.index(['commercial_registration_number']);
    table.index(['is_active']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('customers');
};
