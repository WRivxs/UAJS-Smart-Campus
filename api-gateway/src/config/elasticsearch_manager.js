/**
 * =================================================================================
 * 🔍 UAJS SMART CAMPUS — GESTOR CENTRALIZADO DE ELASTICSEARCH (API GATEWAY)
 * =================================================================================
 */

const { Client } = require('@elastic/elasticsearch');

const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL || 'http://elasticsearch:9200';

const elasticClient = new Client({
  node: ELASTICSEARCH_URL,
  maxRetries: 5,
  requestTimeout: 10000
});

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
            fuzziness: 'AUTO',
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
    console.error('❌ Error en búsqueda Elasticsearch (Gateway):', error.message);
    return [];
  }
}

module.exports = {
  elasticClient,
  searchSmartAllIndices
};
