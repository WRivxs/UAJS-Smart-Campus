const db = require('../config/db');

const EventoModel = {
  create: async ({ nombre, tipo, descripcion, fecha_inicio, fecha_fin, lugar_ubicacion, organizador_id, organizador_nombre, aforo_maximo, imagen_url }) => {
    const query = `
      INSERT INTO eventos (nombre, tipo, descripcion, fecha_inicio, fecha_fin, lugar_ubicacion, organizador_id, organizador_nombre, aforo_maximo, cupos_disponibles, imagen_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;
    const cupos = aforo_maximo || null;
    const values = [
      nombre,
      tipo || 'EVENTO_ACADEMICO',
      descripcion,
      fecha_inicio,
      fecha_fin,
      lugar_ubicacion,
      organizador_id,
      organizador_nombre || null,
      aforo_maximo || null,
      cupos,
      imagen_url || null
    ];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  findAll: async ({ tipo, estado, busqueda }) => {
    let query = `SELECT * FROM eventos WHERE 1=1`;
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

    if (busqueda) {
      query += ` AND (nombre ILIKE $${paramIndex} OR descripcion ILIKE $${paramIndex} OR lugar_ubicacion ILIKE $${paramIndex})`;
      params.push(`%${busqueda}%`);
      paramIndex++;
    }

    query += ` ORDER BY fecha_inicio ASC;`;

    const { rows } = await db.query(query, params);
    return rows;
  },

  findById: async (id) => {
    const query = `SELECT * FROM eventos WHERE id = $1;`;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  },

  findInscripcionesByEventoId: async (evento_id) => {
    const query = `
      SELECT id, usuario_id, usuario_nombre, usuario_email, fecha_inscripcion, asistio
      FROM inscripciones_evento
      WHERE evento_id = $1
      ORDER BY fecha_inscripcion ASC;
    `;
    const { rows } = await db.query(query, [evento_id]);
    return rows;
  },

  inscribirUsuario: async (evento_id, { usuario_id, usuario_nombre, usuario_email }) => {
    // 1. Verificar existencia del evento y disponibilidad de cupos
    const evento = await EventoModel.findById(evento_id);
    if (!evento) {
      return { error: 'El evento especificado no existe.' };
    }

    if (evento.estado === 'CANCELADO' || evento.estado === 'FINALIZADO') {
      return { error: `No es posible inscribirse. El evento se encuentra ${evento.estado}.` };
    }

    if (evento.aforo_maximo !== null && evento.cupos_disponibles <= 0) {
      return { error: 'No hay cupos disponibles para este evento.' };
    }

    // 2. Verificar si el usuario ya está inscrito
    const checkQuery = `SELECT * FROM inscripciones_evento WHERE evento_id = $1 AND usuario_id = $2;`;
    const { rows: checkRows } = await db.query(checkQuery, [evento_id, usuario_id]);
    if (checkRows.length > 0) {
      return { error: 'Ya te encuentras inscrito en este evento.' };
    }

    // 3. Registrar inscripción y descontar cupo
    const insertQuery = `
      INSERT INTO inscripciones_evento (evento_id, usuario_id, usuario_nombre, usuario_email)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const { rows: inscripcionRows } = await db.query(insertQuery, [evento_id, usuario_id, usuario_nombre, usuario_email]);

    if (evento.aforo_maximo !== null) {
      await db.query(`
        UPDATE eventos
        SET cupos_disponibles = cupos_disponibles - 1
        WHERE id = $1;
      `, [evento_id]);
    }

    return { inscripcion: inscripcionRows[0] };
  },

  cancelarInscripcion: async (evento_id, usuario_id) => {
    const deleteQuery = `
      DELETE FROM inscripciones_evento
      WHERE evento_id = $1 AND usuario_id = $2
      RETURNING id;
    `;
    const { rows } = await db.query(deleteQuery, [evento_id, usuario_id]);
    if (rows.length === 0) {
      return null;
    }

    // Aumentar cupo disponible
    await db.query(`
      UPDATE eventos
      SET cupos_disponibles = cupos_disponibles + 1
      WHERE id = $1 AND aforo_maximo IS NOT NULL;
    `, [evento_id]);

    return rows[0];
  },

  findMisInscripciones: async (usuario_id) => {
    const query = `
      SELECT e.*, i.fecha_inscripcion, i.asistio
      FROM inscripciones_evento i
      JOIN eventos e ON i.evento_id = e.id
      WHERE i.usuario_id = $1
      ORDER BY e.fecha_inicio ASC;
    `;
    const { rows } = await db.query(query, [usuario_id]);
    return rows;
  },

  update: async (id, { nombre, tipo, descripcion, fecha_inicio, fecha_fin, lugar_ubicacion, aforo_maximo, imagen_url }) => {
    const query = `
      UPDATE eventos
      SET nombre = COALESCE($1, nombre),
          tipo = COALESCE($2, tipo),
          descripcion = COALESCE($3, descripcion),
          fecha_inicio = COALESCE($4, fecha_inicio),
          fecha_fin = COALESCE($5, fecha_fin),
          lugar_ubicacion = COALESCE($6, lugar_ubicacion),
          aforo_maximo = COALESCE($7, aforo_maximo),
          imagen_url = COALESCE($8, imagen_url)
      WHERE id = $9
      RETURNING *;
    `;
    const { rows } = await db.query(query, [nombre, tipo, descripcion, fecha_inicio, fecha_fin, lugar_ubicacion, aforo_maximo, imagen_url, id]);
    return rows[0];
  },

  updateEstado: async (id, estado) => {
    const query = `
      UPDATE eventos
      SET estado = $1
      WHERE id = $2
      RETURNING *;
    `;
    const { rows } = await db.query(query, [estado, id]);
    return rows[0];
  },

  marcarAsistencia: async (evento_id, usuario_id, asistio = true) => {
    const query = `
      UPDATE inscripciones_evento
      SET asistio = $1
      WHERE evento_id = $2 AND usuario_id = $3
      RETURNING *;
    `;
    const { rows } = await db.query(query, [asistio, evento_id, usuario_id]);
    return rows[0];
  },

  delete: async (id) => {
    const query = `DELETE FROM eventos WHERE id = $1 RETURNING id;`;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }
};

module.exports = EventoModel;
