const db = require('../config/db');

const NotificacionModel = {
  create: async ({ usuario_id, usuario_nombre, tipo, titulo, mensaje, referencia_id, referencia_tipo }) => {
    const query = `
      INSERT INTO notificaciones (usuario_id, usuario_nombre, tipo, titulo, mensaje, referencia_id, referencia_tipo)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [
      usuario_id,
      usuario_nombre || null,
      tipo || 'ALERTA_SISTEMA',
      titulo,
      mensaje,
      referencia_id || null,
      referencia_tipo || null
    ];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  findByUsuarioId: async (usuario_id, leidaFiltro = null) => {
    let query = `SELECT * FROM notificaciones WHERE usuario_id = $1`;
    const params = [usuario_id];

    if (leidaFiltro !== null) {
      query += ` AND leida = $2`;
      params.push(leidaFiltro === 'true' || leidaFiltro === true);
    }

    query += ` ORDER BY fecha_creacion DESC;`;

    const { rows } = await db.query(query, params);
    
    // Contar notificaciones no leídas
    const countQuery = `SELECT COUNT(*) FROM notificaciones WHERE usuario_id = $1 AND leida = false;`;
    const { rows: countRows } = await db.query(countQuery, [usuario_id]);
    const noLeidas = parseInt(countRows[0].count);

    return {
      no_leidas_count: noLeidas,
      notificaciones: rows
    };
  },

  findById: async (id) => {
    const query = `SELECT * FROM notificaciones WHERE id = $1;`;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  },

  marcarComoLeida: async (id, usuario_id) => {
    const query = `
      UPDATE notificaciones
      SET leida = true,
          fecha_lectura = CURRENT_TIMESTAMP
      WHERE id = $1 AND usuario_id = $2
      RETURNING *;
    `;
    const { rows } = await db.query(query, [id, usuario_id]);
    return rows[0];
  },

  marcarTodasComoLeidas: async (usuario_id) => {
    const query = `
      UPDATE notificaciones
      SET leida = true,
          fecha_lectura = CURRENT_TIMESTAMP
      WHERE usuario_id = $1 AND leida = false
      RETURNING id;
    `;
    const { rows } = await db.query(query, [usuario_id]);
    return rows.length; // Retorna cantidad de notificaciones actualizadas
  },

  delete: async (id, usuario_id) => {
    const query = `DELETE FROM notificaciones WHERE id = $1 AND usuario_id = $2 RETURNING id;`;
    const { rows } = await db.query(query, [id, usuario_id]);
    return rows[0];
  }
};

module.exports = NotificacionModel;
