/**
 * =================================================================================
 * 🔍 UAJS SMART CAMPUS — GESTOR CENTRALIZADO DE ELASTICSEARCH
 * =================================================================================
 * Este archivo contiene el algoritmo centralizado de mapeo, inicialización,
 * sincronización e ingesta masiva (Bulk Sync) de las 8 bases de datos relacionales
 * (PostgreSQL) hacia el motor de búsqueda distribuido Elasticsearch.
 *
 * 🎓 Presentación Académica:
 * - Demuestra la integración entre PostgreSQL (BD Transaccional) y Elasticsearch (Búsqueda Full-Text).
 * - Implementa análisis de texto en español, tolerancia a errores tipográficos (Fuzzy Matching)
 *   y puntuación por relevancia (Scoring).
 * =================================================================================
 */

const { Client } = require('@elastic/elasticsearch');
const { Pool } = require('pg');

// ─────────────────────────────────────────────────────────────────────────────
// 1. Configuración del Cliente de Elasticsearch
// ─────────────────────────────────────────────────────────────────────────────
const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';

const elasticClient = new Client({
  node: ELASTICSEARCH_URL,
  maxRetries: 5,
  requestTimeout: 10000
});

// Configuración de conexiones PostgreSQL para las 8 bases de datos del monorepo
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 5432;
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'uajs_secure_password_2026';

const getPgPool = (dbName) => new Pool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: dbName,
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Definición del Esquema de Mapeos (Mappings) para los 8 Microservicios
// ─────────────────────────────────────────────────────────────────────────────
const ELASTIC_INDEXES = {
  // 1. Microservicio de Usuarios
  'idx_usuarios': {
    mappings: {
      properties: {
        id: { type: 'keyword' },
        nombre: { type: 'text', analyzer: 'spanish' },
        apellido: { type: 'text', analyzer: 'spanish' },
        email: { type: 'keyword' },
        rol_nombre: { type: 'keyword' },
        programa_academico: { type: 'text', analyzer: 'spanish' },
        estado: { type: 'keyword' }
      }
    }
  },

  // 2. Microservicio de Servicios Universitarios
  'idx_servicios': {
    mappings: {
      properties: {
        id: { type: 'keyword' },
        nombre: { type: 'text', analyzer: 'spanish' },
        descripcion: { type: 'text', analyzer: 'spanish' },
        categoria: { type: 'keyword' },
        ubicacion: { type: 'text', analyzer: 'spanish' },
        horario_atencion: { type: 'text' },
        estado: { type: 'keyword' }
      }
    }
  },

  // 3. Microservicio de Solicitudes y Trámites
  'idx_solicitudes': {
    mappings: {
      properties: {
        id: { type: 'keyword' },
        tipo_tramite: { type: 'text', analyzer: 'spanish' },
        estudiante_id: { type: 'keyword' },
        descripcion_solicitud: { type: 'text', analyzer: 'spanish' },
        estado: { type: 'keyword' },
        fecha_creacion: { type: 'date' }
      }
    }
  },

  // 4. Microservicio de PQRS (Peticiones, Quejas, Reclamos y Sugerencias)
  'idx_pqrs': {
    mappings: {
      properties: {
        id: { type: 'keyword' },
        radicado: { type: 'keyword' },
        tipo: { type: 'keyword' },
        asunto: { type: 'text', analyzer: 'spanish' },
        descripcion: { type: 'text', analyzer: 'spanish' },
        estado: { type: 'keyword' },
        fecha_radicacion: { type: 'date' }
      }
    }
  },

  // 5. Microservicio de Recursos (Laboratorios, Equipos, Aulas)
  'idx_recursos': {
    mappings: {
      properties: {
        id: { type: 'keyword' },
        nombre_recurso: { type: 'text', analyzer: 'spanish' },
        tipo_recurso: { type: 'keyword' },
        descripcion: { type: 'text', analyzer: 'spanish' },
        ubicacion: { type: 'text', analyzer: 'spanish' },
        estado_disponibilidad: { type: 'keyword' }
      }
    }
  },

  // 6. Microservicio de Reservas
  'idx_reservas': {
    mappings: {
      properties: {
        id: { type: 'keyword' },
        recurso_id: { type: 'keyword' },
        usuario_id: { type: 'keyword' },
        motivo: { type: 'text', analyzer: 'spanish' },
        fecha_inicio: { type: 'date' },
        fecha_fin: { type: 'date' },
        estado: { type: 'keyword' }
      }
    }
  },

  // 7. Microservicio de Notificaciones
  'idx_notificaciones': {
    mappings: {
      properties: {
        id: { type: 'keyword' },
        usuario_id: { type: 'keyword' },
        titulo: { type: 'text', analyzer: 'spanish' },
        mensaje: { type: 'text', analyzer: 'spanish' },
        tipo: { type: 'keyword' },
        leido: { type: 'boolean' }
      }
    }
  },

  // 8. Microservicio de Eventos Universitarios
  'idx_eventos': {
    mappings: {
      properties: {
        id: { type: 'keyword' },
        titulo: { type: 'text', analyzer: 'spanish' },
        descripcion: { type: 'text', analyzer: 'spanish' },
        organizador: { type: 'text', analyzer: 'spanish' },
        lugar: { type: 'text', analyzer: 'spanish' },
        fecha_evento: { type: 'date' },
        cupos_disponibles: { type: 'integer' }
      }
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. Algoritmo de Inicialización de Índices en Elasticsearch
// ─────────────────────────────────────────────────────────────────────────────
async function initElasticIndices() {
  console.log('🔍 Iniciando verificación de Índices en Elasticsearch...');
  try {
    const health = await elasticClient.cluster.health();
    console.log(`✅ Conectado a Elasticsearch Cluster [Status: ${health.status}]`);

    for (const [indexName, indexConfig] of Object.entries(ELASTIC_INDEXES)) {
      const exists = await elasticClient.indices.exists({ index: indexName });
      if (!exists) {
        await elasticClient.indices.create({
          index: indexName,
          body: indexConfig
        });
        console.log(`🟢 Índice creado exitosamente: '${indexName}'`);
      } else {
        console.log(`ℹ️  El índice '${indexName}' ya existe.`);
      }
    }
  } catch (error) {
    console.error('❌ Error al inicializar índices en Elasticsearch:', error.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Algoritmo de Sincronización e Ingesta Masiva (PostgreSQL ➔ Elasticsearch)
// ─────────────────────────────────────────────────────────────────────────────
async function syncAllDatabasesToElastic() {
  console.log('🔄 Iniciando Algoritmo de Sincronización Masiva (Bulk Sync)...');

  const syncConfig = [
    { index: 'idx_usuarios', db: 'db_usuarios', table: 'usuarios' },
    { index: 'idx_servicios', db: 'db_servicios', table: 'servicios' },
    { index: 'idx_solicitudes', db: 'db_solicitudes', table: 'solicitudes' },
    { index: 'idx_pqrs', db: 'db_pqrs', table: 'pqrs' },
    { index: 'idx_recursos', db: 'db_recursos', table: 'recursos' },
    { index: 'idx_reservas', db: 'db_reservas', table: 'reservas' },
    { index: 'idx_notificaciones', db: 'db_notificaciones', table: 'notificaciones' },
    { index: 'idx_eventos', db: 'db_eventos', table: 'eventos' },
  ];

  for (const item of syncConfig) {
    const pool = getPgPool(item.db);
    try {
      const res = await pool.query(`SELECT * FROM ${item.table}`);
      if (res.rows.length > 0) {
        const operations = res.rows.flatMap(doc => [
          { index: { _index: item.index, _id: doc.id } },
          doc
        ]);
        const bulkResponse = await elasticClient.bulk({ refresh: true, operations });
        if (!bulkResponse.errors) {
          console.log(`✅ Sincronizados ${res.rows.length} registros en '${item.index}' desde [${item.db}.${item.table}]`);
        }
      }
    } catch (err) {
      console.log(`⚠️  Tabla '${item.table}' en '${item.db}' vacía o no disponible para sincronizar aún.`);
    } finally {
      await pool.end();
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Motor de Búsqueda Inteligente Multicampo con Tolerancia a Fallos
// ─────────────────────────────────────────────────────────────────────────────
async function searchSmartAllIndices(queryText) {
  if (!queryText || queryText.trim() === '') return [];

  try {
    const result = await elasticClient.search({
      index: ['idx_servicios', 'idx_pqrs', 'idx_solicitudes', 'idx_recursos', 'idx_eventos'],
      body: {
        query: {
          multi_match: {
            query: queryText,
            fields: [
              'titulo^3',
              'nombre^3',
              'nombre_recurso^3',
              'asunto^2',
              'descripcion',
              'categoria',
              'ubicacion'
            ],
            fuzziness: 'AUTO',       // Tolerancia a errores ortográficos (ej. "bibloteca")
            prefix_length: 2
          }
        }
      }
    });

    return result.hits.hits.map(hit => ({
      indice: hit._index,
      id: hit._id,
      score: hit._score,
      datos: hit._source
    }));
  } catch (error) {
    console.error('❌ Error en búsqueda Elasticsearch:', error.message);
    return [];
  }
}

module.exports = {
  elasticClient,
  initElasticIndices,
  syncAllDatabasesToElastic,
  searchSmartAllIndices
};
