exports.up = function(knex) {
  return knex.schema.createTable('digital_signatures', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('invoice_id').references('id').inTable('invoices').notNullable();
    table.string('certificate_id').notNullable();
    table.text('signature_value').notNullable();
    table.string('signature_method').defaultTo('RSA-SHA256');
    table.timestamp('signature_timestamp').defaultTo(knex.fn.now());
    table.string('signer_name');
    table.string('signer_role');
    table.boolean('is_valid').defaultTo(true);
    table.json('validation_errors');
    table.string('pki_provider').defaultTo('Oman_PKI');
    table.json('certificate_chain');
    table.enum('revocation_status', ['valid', 'revoked', 'unknown']).defaultTo('valid');
    table.timestamps(true, true);
    
    // Indexes
    table.index(['invoice_id']);
    table.index(['certificate_id']);
    table.index(['is_valid']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('digital_signatures');
};