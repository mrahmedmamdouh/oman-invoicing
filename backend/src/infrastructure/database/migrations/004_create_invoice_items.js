exports.up = function(knex) {
  return knex.schema.createTable('invoice_items', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('invoice_id').references('id').inTable('invoices').onDelete('CASCADE');
    table.text('description').notNullable();
    table.text('description_ar');
    table.decimal('quantity', 15, 3).defaultTo(1);
    table.decimal('unit_price', 15, 3).notNullable();
    table.decimal('total', 15, 3).notNullable();
    table.boolean('taxable').defaultTo(true);
    table.decimal('vat_rate', 5, 4).defaultTo(0.05);
    table.string('product_code');
    table.string('unit').defaultTo('piece');
    table.integer('sort_order').defaultTo(0);
    table.timestamps(true, true);
    
    // Indexes
    table.index(['invoice_id']);
    table.index(['product_code']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('invoice_items');
};
