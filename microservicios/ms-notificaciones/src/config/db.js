const { Pool } = require('pg');
require('dotenv').config();

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false }
    }
  : {
      host: process.env.DB_HOST || 'db',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'uajs_secure_password_2026',
      database: process.env.DB_NAME || 'db_notificaciones',
    };

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  console.log('📦 Conectado exitosamente a la base de datos PostgreSQL (db_notificaciones)');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en el cliente de PostgreSQL (db_notificaciones):', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
