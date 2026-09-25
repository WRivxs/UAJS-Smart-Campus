/**
 * Script de sincronización masiva PostgreSQL → Elasticsearch
 * Ejecutar dentro del contenedor api-gateway:
 *   node /app/sync_elastic.js
 */

const { Client } = require('@elastic/elasticsearch');
const { Pool } = require('pg');

const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL || 'http://elasticsearch:9200';
const DB_HOST = process.env.DB_HOST || 'uajs-postgres-db';
const DB_PORT = process.env.DB_PORT || 5432;
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'uajs_secure_password_2026';

const elasticClient = new Client({ node: ELASTICSEARCH_URL, maxRetries: 5, requestTimeout: 15000 });

const getPgPool = (dbName) => new Pool({ host: DB_HOST, port: DB_PORT, user: DB_USER, password: DB_PASSWORD, database: dbName });

async function syncAll() {
  console.log('🔄 Iniciando Bulk Sync PostgreSQL ➔ Elasticsearch...\n');

  const syncConfig = [
    { index: 'idx_usuarios',       db: 'db_usuarios',       table: 'usuarios' },
    { index: 'idx_servicios',      db: 'db_servicios',      table: 'servicios' },
    { index: 'idx_solicitudes',    db: 'db_solicitudes',    table: 'solicitudes' },
    { index: 'idx_pqrs',           db: 'db_pqrs',           table: 'pqrs' },
    { index: 'idx_recursos',       db: 'db_recursos',       table: 'recursos' },
    { index: 'idx_reservas',       db: 'db_reservas',       table: 'reservas' },
    { index: 'idx_notificaciones', db: 'db_notificaciones', table: 'notificaciones' },
    { index: 'idx_eventos',        db: 'db_eventos',        table: 'eventos' },
  ];

  for (const item of syncConfig) {
    const pool = getPgPool(item.db);
    try {
      // Asegurarse de que el índice existe
      const exists = await elasticClient.indices.exists({ index: item.index });
      if (!exists) {
        await elasticClient.indices.create({ index: item.index });
        console.log(`  📁 Índice '${item.index}' creado.`);
      }

      const res = await pool.query(`SELECT * FROM ${item.table} LIMIT 1000`);
      if (res.rows.length > 0) {
        const operations = res.rows.flatMap(doc => [
          { index: { _index: item.index, _id: String(doc.id) } },
          doc
        ]);
        const bulkResponse = await elasticClient.bulk({ refresh: true, operations });
        if (bulkResponse.errors) {
          const errored = bulkResponse.items.filter(i => i.index && i.index.error);
          console.log(`⚠️  ${item.index}: ${errored.length} errores de los ${res.rows.length} documentos.`);
          errored.slice(0, 3).forEach(e => console.log('   ', JSON.stringify(e.index.error)));
        } else {
          console.log(`✅  ${item.index}: ${res.rows.length} registros sincronizados desde [${item.db}.${item.table}]`);
        }
      } else {
        console.log(`ℹ️  ${item.index}: tabla '${item.table}' vacía, no hay datos que sincronizar.`);
      }
    } catch (err) {
      console.log(`❌  ${item.index}: ERROR - ${err.message}`);
    } finally {
      await pool.end();
    }
  }

  console.log('\n🏁 Bulk Sync completado.');
  process.exit(0);
}

syncAll().catch(err => { console.error('Error fatal:', err); process.exit(1); });
