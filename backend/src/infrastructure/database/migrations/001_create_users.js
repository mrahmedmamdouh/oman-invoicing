exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('username').unique().notNullable();
    table.string('email').unique().notNullable();
    table.string('password_hash').notNullable();
    table.string('full_name').notNullable();
    table.string('full_name_ar'); // Arabic name
    table.string('role').defaultTo('user'); // admin, user, accountant
    table.boolean('is_active').defaultTo(true);
    table.string('tax_registration_number');
    table.string('commercial_registration_number');
    table.string('language').defaultTo('ar'); // ar, en
    table.timestamp('last_login_at');
    table.timestamps(true, true);
    
    // Indexes
    table.index(['email']);
    table.index(['username']);
    table.index(['is_active']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
