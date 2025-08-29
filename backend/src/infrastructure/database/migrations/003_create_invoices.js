exports.up = function(knex) {
  return knex.schema.createTable('invoices', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('invoice_number').unique().notNullable();
    table.uuid('customer_id').references('id').inTable('customers').notNullable();
    table.date('issue_date').notNullable();
    table.string('issue_date_hijri');
    table.date('due_date');
    table.string('due_date_hijri');
    table.enum('status', ['draft', 'sent', 'paid', 'overdue', 'cancelled']).defaultTo('draft');
    table.string('currency', 3).defaultTo('OMR');
    table.decimal('exchange_rate', 10, 4).defaultTo(1.0);
    
    // Tax fields
    table.decimal('subtotal', 15, 3).defaultTo(0);
    table.decimal('vat_amount', 15, 3).defaultTo(0);
    table.decimal('vat_rate', 5, 4).defaultTo(0.05);
    table.decimal('corporate_tax_amount', 15, 3).defaultTo(0);
    table.decimal('corporate_tax_rate', 5, 4).defaultTo(0.15);
    table.decimal('total_amount', 15, 3).defaultTo(0);
    
    // Oman specific
    table.string('tax_registration_number');
    table.string('commercial_registration_number');
    table.text('qr_code');
    table.uuid('digital_signature_id');
    table.string('peppol_id');
    
    // Compliance
    table.date('retention_until');
    table.boolean('is_finalized').defaultTo(false);
    table.timestamp('finalized_at');
    
    table.uuid('created_by').references('id').inTable('users');
    table.timestamps(true, true);
    
    // Indexes
    table.index(['customer_id']);
    table.index(['status']);
    table.index(['issue_date']);
    table.index(['invoice_number']);
    table.index(['tax_registration_number']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('invoices');
};
