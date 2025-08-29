const knex = require('knex');
const logger = require('../shared/utils/logger');

const config = {
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'oman_invoicing',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    charset: 'utf8',
    timezone: 'Asia/Muscat'
  },
  pool: {
    min: 2,
    max: 10,
    createTimeoutMillis: 3000,
    acquireTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 100,
  },
  migrations: {
    directory: './src/infrastructure/database/migrations',
    tableName: 'knex_migrations'
  },
  seeds: {
    directory: './src/infrastructure/database/seeds'
  }
};

const db = knex(config);

const connectDatabase = async () => {
  try {
    await db.raw('SELECT 1+1 AS result');
    logger.info('🗄️ PostgreSQL connected successfully');
    
    // Set Arabic collation support
    await db.raw("SET lc_collate = 'ar_OM.UTF-8'");
    await db.raw("SET lc_ctype = 'ar_OM.UTF-8'");
    
    return db;
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    throw error;
  }
};

module.exports = {
  db,
  connectDatabase
};