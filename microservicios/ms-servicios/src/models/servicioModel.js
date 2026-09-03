const db = require('../config/db');

const ServicioModel = {
  findAllCategorias: async () => {
    const query = `SELECT * FROM categorias_servicios ORDER BY id ASC;`;
    const { rows } = await db.query(query);
    return rows;
  },

  createCategoria: async ({ nombre, descripcion, icono }) => {
    const query = `
      INSERT INTO categorias_servicios (nombre, descripcion, icono)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const { rows } = await db.query(query, [nombre, descripcion, icono || 'file-text']);
    return rows[0];
  },

  findAllServicios: async (categoria_id) => {
    let query = `
      SELECT s.*, c.nombre AS categoria_nombre, c.icono AS categoria_icono
      FROM servicios s
      JOIN categorias_servicios c ON s.categoria_id = c.id
      WHERE s.estado = 'activo'
    `;
    const params = [];

    if (categoria_id) {
      query += ` AND s.categoria_id = $1`;
      params.push(categoria_id);
    }

    query += ` ORDER BY s.id ASC;`;

    const { rows } = await db.query(query, params);
    return rows;
  },

  findById: async (id) => {
    const query = `
      SELECT s.*, c.nombre AS categoria_nombre, c.icono AS categoria_icono, c.descripcion AS categoria_descripcion
      FROM servicios s
      JOIN categorias_servicios c ON s.categoria_id = c.id
      WHERE s.id = $1;
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  },

  createServicio: async ({ categoria_id, nombre, descripcion, requisitos, tiempo_respuesta_estimado, requiere_aprobacion, encargado_departamento }) => {
    const query = `
      INSERT INTO servicios (categoria_id, nombre, descripcion, requisitos, tiempo_respuesta_estimado, requiere_aprobacion, encargado_departamento)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [
      categoria_id, 
      nombre, 
      descripcion, 
      requisitos, 
      tiempo_respuesta_estimado || '24-48 horas hábiles', 
      requiere_aprobacion ?? true, 
      encargado_departamento
    ];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  updateServicio: async (id, { categoria_id, nombre, descripcion, requisitos, tiempo_respuesta_estimado, requiere_aprobacion, encargado_departamento, estado }) => {
    const query = `
      UPDATE servicios
      SET categoria_id = COALESCE($1, categoria_id),
          nombre = COALESCE($2, nombre),
          descripcion = COALESCE($3, descripcion),
          requisitos = COALESCE($4, requisitos),
          tiempo_respuesta_estimado = COALESCE($5, tiempo_respuesta_estimado),
          requiere_aprobacion = COALESCE($6, requiere_aprobacion),
          encargado_departamento = COALESCE($7, encargado_departamento),
          estado = COALESCE($8, estado),
          actualizado_en = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *;
    `;
    const values = [categoria_id, nombre, descripcion, requisitos, tiempo_respuesta_estimado, requiere_aprobacion, encargado_departamento, estado, id];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  deleteServicio: async (id) => {
    const query = `DELETE FROM servicios WHERE id = $1 RETURNING id;`;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }
};

module.exports = ServicioModel;
