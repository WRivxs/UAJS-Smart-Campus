const db = require('../config/db');

const RecursoModel = {
  create: async ({ codigo, nombre, tipo, ubicacion, estado, disponibilidad, descripcion, imagen_url, aforo_maximo }) => {
    const query = `
      INSERT INTO recursos (codigo, nombre, tipo, ubicacion, estado, disponibilidad, descripcion, imagen_url, aforo_maximo)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    const values = [
      codigo, 
      nombre, 
      tipo || 'RECURSO_TECNOLOGICO', 
      ubicacion, 
      estado || 'BUENO', 
      disponibilidad !== undefined ? disponibilidad : true, 
      descripcion || null, 
      imagen_url || null, 
      aforo_maximo || null
    ];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  findAll: async ({ tipo, estado, disponibilidad, busqueda }) => {
    let query = `SELECT * FROM recursos WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    if (tipo) {
      query += ` AND tipo = $${paramIndex}`;
      params.push(tipo);
      paramIndex++;
    }

    if (estado) {
      query += ` AND estado = $${paramIndex}`;
      params.push(estado);
      paramIndex++;
    }

    if (disponibilidad !== undefined) {
      query += ` AND disponibilidad = $${paramIndex}`;
      params.push(disponibilidad === 'true' || disponibilidad === true);
      paramIndex++;
    }

    if (busqueda) {
      query += ` AND (nombre ILIKE $${paramIndex} OR codigo ILIKE $${paramIndex} OR ubicacion ILIKE $${paramIndex})`;
      params.push(`%${busqueda}%`);
      paramIndex++;
    }

    query += ` ORDER BY id ASC;`;

    const { rows } = await db.query(query, params);
    return rows;
  },

  findById: async (id) => {
    const query = `SELECT * FROM recursos WHERE id = $1;`;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  },

  findByCodigo: async (codigo) => {
    const query = `SELECT * FROM recursos WHERE codigo = $1;`;
    const { rows } = await db.query(query, [codigo]);
    return rows[0];
  },

  update: async (id, { nombre, tipo, ubicacion, descripcion, imagen_url, aforo_maximo }) => {
    const query = `
      UPDATE recursos
      SET nombre = COALESCE($1, nombre),
          tipo = COALESCE($2, tipo),
          ubicacion = COALESCE($3, ubicacion),
          descripcion = COALESCE($4, descripcion),
          imagen_url = COALESCE($5, imagen_url),
          aforo_maximo = COALESCE($6, aforo_maximo),
          actualizado_en = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *;
    `;
    const { rows } = await db.query(query, [nombre, tipo, ubicacion, descripcion, imagen_url, aforo_maximo, id]);
    return rows[0];
  },

  updateEstado: async (id, estado, disponibilidad) => {
    const isDisponible = disponibilidad !== undefined ? disponibilidad : (estado === 'BUENO');
    const query = `
      UPDATE recursos
      SET estado = $1,
          disponibilidad = $2,
          actualizado_en = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *;
    `;
    const { rows } = await db.query(query, [estado, isDisponible, id]);
    return rows[0];
  },

  registrarMantenimiento: async (recurso_id, { tipo_mantenimiento, descripcion, tecnico_responsable }) => {
    // 1. Marcar el recurso en mantenimiento
    await db.query(`
      UPDATE recursos
      SET estado = 'EN_MANTENIMIENTO', disponibilidad = false, actualizado_en = CURRENT_TIMESTAMP
      WHERE id = $1;
    `, [recurso_id]);

    // 2. Insertar ticket de mantenimiento
    const query = `
      INSERT INTO mantenimientos_recurso (recurso_id, tipo_mantenimiento, descripcion, tecnico_responsable)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const { rows } = await db.query(query, [recurso_id, tipo_mantenimiento || 'PREVENTIVO', descripcion, tecnico_responsable]);
    return rows[0];
  },

  findMantenimientosByRecursoId: async (recurso_id) => {
    const query = `
      SELECT * FROM mantenimientos_recurso
      WHERE recurso_id = $1
      ORDER BY fecha_inicio DESC;
    `;
    const { rows } = await db.query(query, [recurso_id]);
    return rows;
  },

  delete: async (id) => {
    const query = `DELETE FROM recursos WHERE id = $1 RETURNING id;`;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }
};

module.exports = RecursoModel;
