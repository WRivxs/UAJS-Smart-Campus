const db = require('../config/db');

const PqrsModel = {
  create: async ({ usuario_id, usuario_nombre, usuario_email, tipo, asunto, descripcion, dependencia_destino, anonimo }) => {
    const isAnonimo = Boolean(anonimo);
    const displayName = isAnonimo ? 'Usuario Anónimo' : usuario_nombre;

    const query = `
      INSERT INTO pqrs (usuario_id, usuario_nombre, usuario_email, tipo, asunto, descripcion, dependencia_destino, anonimo)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [usuario_id, displayName, usuario_email, tipo || 'PETICION', asunto, descripcion, dependencia_destino, isAnonimo];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  findAll: async ({ usuario_id, rol_nombre, estado, dependencia, tipo }) => {
    let query = `SELECT * FROM pqrs WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    // Si es estudiante, solo consulta sus propios tickets de PQRS
    if (rol_nombre === 'Estudiante') {
      query += ` AND usuario_id = $${paramIndex}`;
      params.push(usuario_id);
      paramIndex++;
    }

    if (estado) {
      query += ` AND estado = $${paramIndex}`;
      params.push(estado);
      paramIndex++;
    }

    if (dependencia) {
      query += ` AND dependencia_destino = $${paramIndex}`;
      params.push(dependencia);
      paramIndex++;
    }

    if (tipo) {
      query += ` AND tipo = $${paramIndex}`;
      params.push(tipo);
      paramIndex++;
    }

    query += ` ORDER BY id DESC;`;

    const { rows } = await db.query(query, params);
    return rows;
  },

  findById: async (id) => {
    const query = `SELECT * FROM pqrs WHERE id = $1;`;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  },

  findRespuestasByPqrsId: async (pqrs_id) => {
    const query = `
      SELECT * FROM respuestas_pqrs
      WHERE pqrs_id = $1
      ORDER BY fecha_respuesta ASC;
    `;
    const { rows } = await db.query(query, [pqrs_id]);
    return rows;
  },

  responderPqrs: async (id, respondido_por_id, respondido_por_nombre, mensaje) => {
    // 1. Actualizar el ticket de PQRS
    const updateQuery = `
      UPDATE pqrs
      SET respuesta = $1,
          fecha_respuesta = CURRENT_TIMESTAMP,
          responsable_id = $2,
          responsable_nombre = $3,
          estado = 'RESPONDIDA',
          actualizado_en = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *;
    `;
    const { rows } = await db.query(updateQuery, [mensaje, respondido_por_id, respondido_por_nombre, id]);
    const pqrsActualizada = rows[0];

    if (!pqrsActualizada) return null;

    // 2. Registrar en la tabla respuestas_pqrs
    await db.query(`
      INSERT INTO respuestas_pqrs (pqrs_id, respondido_por_id, respondido_por_nombre, mensaje)
      VALUES ($1, $2, $3, $4);
    `, [id, respondido_por_id, respondido_por_nombre, mensaje]);

    return pqrsActualizada;
  },

  updateEstado: async (id, estado) => {
    const query = `
      UPDATE pqrs
      SET estado = $1,
          actualizado_en = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *;
    `;
    const { rows } = await db.query(query, [estado, id]);
    return rows[0];
  },

  delete: async (id) => {
    const query = `DELETE FROM pqrs WHERE id = $1 RETURNING id;`;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }
};

module.exports = PqrsModel;
