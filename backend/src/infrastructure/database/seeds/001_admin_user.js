const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  // Delete existing entries
  await knex('users').del();

  // Insert admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  await knex('users').insert([
    {
      username: 'admin',
      email: 'admin@oman-invoicing.om',
      password_hash: hashedPassword,
      full_name: 'مدير النظام',
      full_name_ar: 'مدير النظام',
      role: 'admin',
      is_active: true,
      language: 'ar',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    }
  ]);
};
