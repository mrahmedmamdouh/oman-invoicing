exports.up = function(knex) {
  return knex.schema.createTable('peppol_messages', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('invoice_id').references('id').inTable('invoices').notNullable();
    table.string('message_id').unique().notNullable();
    table.string('sender_id').notNullable();
    table.string('receiver_id').notNullable();
    table.enum('document_type', ['Invoice', 'CreditNote', 'DebitNote']).defaultTo('Invoice');
    table.enum('status', ['pending', 'sent', 'delivered', 'failed']).defaultTo('pending');
    table.text('content'); // UBL XML content
    table.timestamp('sent_at');
    table.timestamp('delivered_at');
    table.json('delivery_receipt');
    table.text('error_message');
    table.timestamps(true, true);
    
    // Indexes
    table.index(['invoice_id']);
    table.index(['message_id']);
    table.index(['status']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('peppol_messages');
};