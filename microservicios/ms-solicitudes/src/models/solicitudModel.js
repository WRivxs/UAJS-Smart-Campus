const db = require('../config/db');

const SolicitudModel = {
  create: async ({ usuario_id, usuario_nombre, usuario_email, servicio_id, tipo, dependencia, asunto, descripcion, prioridad, observaciones }) => {
    const query = `
      INSERT INTO solicitudes (usuario_id, usuario_nombre, usuario_email, servicio_id, tipo, dependencia, asunto, descripcion, prioridad, observaciones)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    const values = [
      usuario_id, 
      usuario_nombre, 
      usuario_email, 
      servicio_id || null, 
      tipo || 'ACADEMICA', 
      dependencia, 
      asunto, 
      descripcion, 
      prioridad || 'MEDIA', 
      observaciones || 'Solicitud registrada en el sistema.'
    ];
    
    const { rows } = await db.query(query, values);
    const nuevaSolicitud = rows[0];

    // Registrar en el historial de estados
    await db.query(`
      INSERT INTO historial_estados_solicitud (solicitud_id, estado_anterior, estado_nuevo, cambiado_por_id, cambiado_por_nombre, observacion)
      VALUES ($1, 'CREADO', $2, $3, $4, $5);
    `, [nuevaSolicitud.id, nuevaSolicitud.estado, usuario_id, usuario_nombre, 'Registro inicial de la solicitud.']);

    return nuevaSolicitud;
  },

  findAll: async ({ usuario_id, rol_nombre, estado, dependencia }) => {
    let query = `SELECT * FROM solicitudes WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    // Estudiantes y Docentes solo ven sus propias solicitudes, a menos que sean Administrativo o Admin
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
      query += ` AND dependencia = $${paramIndex}`;
      params.push(dependencia);
      paramIndex++;
    }

    query += ` ORDER BY id DESC;`;

    const { rows } = await db.query(query, params);
    return rows;
  },

  findById: async (id) => {
    const query = `SELECT * FROM solicitudes WHERE id = $1;`;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  },

  findHistorialBySolicitudId: async (solicitud_id) => {
    const query = `
      SELECT * FROM historial_estados_solicitud
      WHERE solicitud_id = $1
      ORDER BY fecha_cambio ASC;
    `;
    const { rows } = await db.query(query, [solicitud_id]);
    return rows;
  },

  updateEstado: async (id, estado_nuevo, cambiado_por_id, cambiado_por_nombre, observacion) => {
    // 1. Obtener estado actual
    const solActual = await SolicitudModel.findById(id);
    if (!solActual) return null;

    const estado_anterior = solActual.estado;

    // 2. Actualizar estado y observaciones
    const updateQuery = `
      UPDATE solicitudes
      SET estado = $1,
          observaciones = COALESCE($2, observaciones),
          actualizado_en = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *;
    `;
    const { rows } = await db.query(updateQuery, [estado_nuevo, observacion, id]);
    const solActualizada = rows[0];

    // 3. Registrar en historial de trazabilidad
    await db.query(`
      INSERT INTO historial_estados_solicitud (solicitud_id, estado_anterior, estado_nuevo, cambiado_por_id, cambiado_por_nombre, observacion)
      VALUES ($1, $2, $3, $4, $5, $6);
    `, [id, estado_anterior, estado_nuevo, cambiado_por_id, cambiado_por_nombre, observacion || 'Cambio de estado en el sistema']);

    return solActualizada;
  },

  assignResponsable: async (id, responsable_id, responsable_nombre, cambiado_por_id, cambiado_por_nombre) => {
    const solActual = await SolicitudModel.findById(id);
    if (!solActual) return null;

    const estado_nuevo = solActual.estado === 'REGISTRADA' ? 'ASIGNADA' : solActual.estado;

    const query = `
      UPDATE solicitudes
      SET responsable_id = $1,
          responsable_nombre = $2,
          estado = $3,
          actualizado_en = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *;
    `;
    const { rows } = await db.query(query, [responsable_id, responsable_nombre, estado_nuevo, id]);
    const solActualizada = rows[0];

    // Registrar en el historial
    await db.query(`
      INSERT INTO historial_estados_solicitud (solicitud_id, estado_anterior, estado_nuevo, cambiado_por_id, cambiado_por_nombre, observacion)
      VALUES ($1, $2, $3, $4, $5, $6);
    `, [id, solActual.estado, estado_nuevo, cambiado_por_id, cambiado_por_nombre, `Asignado responsable: ${responsable_nombre}`]);

    return solActualizada;
  },

  update: async (id, { asunto, descripcion, prioridad, dependencia }) => {
    const query = `
      UPDATE solicitudes
      SET asunto = COALESCE($1, asunto),
          descripcion = COALESCE($2, descripcion),
          prioridad = COALESCE($3, prioridad),
          dependencia = COALESCE($4, dependencia),
          actualizado_en = CURRENT_TIMESTAMP
      WHERE id = $5 AND estado = 'REGISTRADA'
      RETURNING *;
    `;
    const { rows } = await db.query(query, [asunto, descripcion, prioridad, dependencia, id]);
    return rows[0];
  },

  delete: async (id) => {
    const query = `DELETE FROM solicitudes WHERE id = $1 RETURNING id;`;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }
};

module.exports = SolicitudModel;
