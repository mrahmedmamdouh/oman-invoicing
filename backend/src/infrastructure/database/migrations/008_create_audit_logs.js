exports.up = function(knex) {
  return knex.schema.createTable('audit_logs', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users');
    table.string('entity_type').notNullable(); // Invoice, Customer, etc.
    table.uuid('entity_id').notNullable();
    table.enum('action', ['create', 'update', 'delete', 'finalize', 'send']).notNullable();
    table.json('old_values');
    table.json('new_values');
    table.string('ip_address');
    table.string('user_agent');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index(['user_id']);
    table.index(['entity_type', 'entity_id']);
    table.index(['action']);
    table.index(['created_at']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('audit_logs');
};