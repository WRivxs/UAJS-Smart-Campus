const db = require('../config/db');

const ReservaModel = {
  // Algoritmo de detección de choque de horarios (Overlap Detection)
  validarSolapamiento: async (recurso_id, fecha_reserva, hora_inicio, hora_fin, reservaIdExcluida = null) => {
    let query = `
      SELECT * FROM reservas
      WHERE recurso_id = $1
        AND fecha_reserva = $2
        AND estado_reserva IN ('PENDIENTE', 'APROBADA')
        AND (hora_inicio < $4 AND hora_fin > $3)
    `;
    const params = [recurso_id, fecha_reserva, hora_inicio, hora_fin];

    if (reservaIdExcluida) {
      query += ` AND id != $5`;
      params.push(reservaIdExcluida);
    }

    const { rows } = await db.query(query, params);
    return rows.length > 0; // Retorna true si hay un conflicto de solapamiento
  },

  create: async ({ recurso_id, recurso_nombre, usuario_id, usuario_nombre, usuario_email, fecha_reserva, hora_inicio, hora_fin, motivo, observaciones }) => {
    // 1. Validar si existe choque de horarios antes de registrar
    const hayChoque = await ReservaModel.validarSolapamiento(recurso_id, fecha_reserva, hora_inicio, hora_fin);
    if (hayChoque) {
      return { conflict: true, message: `El recurso '${recurso_nombre}' ya cuenta con una reserva activa o aprobada en el rango de ${hora_inicio} a ${hora_fin} el día ${fecha_reserva}.` };
    }

    const query = `
      INSERT INTO reservas (recurso_id, recurso_nombre, usuario_id, usuario_nombre, usuario_email, fecha_reserva, hora_inicio, hora_fin, motivo, observaciones)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    const values = [
      recurso_id, 
      recurso_nombre, 
      usuario_id, 
      usuario_nombre, 
      usuario_email, 
      fecha_reserva, 
      hora_inicio, 
      hora_fin, 
      motivo, 
      observaciones || null
    ];
    const { rows } = await db.query(query, values);
    return { conflict: false, reserva: rows[0] };
  },

  findAll: async ({ usuario_id, rol_nombre, recurso_id, fecha_reserva, estado_reserva }) => {
    let query = `SELECT * FROM reservas WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    // Estudiantes ven solo sus propias reservas
    if (rol_nombre === 'Estudiante') {
      query += ` AND usuario_id = $${paramIndex}`;
      params.push(usuario_id);
      paramIndex++;
    }

    if (recurso_id) {
      query += ` AND recurso_id = $${paramIndex}`;
      params.push(recurso_id);
      paramIndex++;
    }

    if (fecha_reserva) {
      query += ` AND fecha_reserva = $${paramIndex}`;
      params.push(fecha_reserva);
      paramIndex++;
    }

    if (estado_reserva) {
      query += ` AND estado_reserva = $${paramIndex}`;
      params.push(estado_reserva);
      paramIndex++;
    }

    query += ` ORDER BY fecha_reserva DESC, hora_inicio ASC;`;

    const { rows } = await db.query(query, params);
    return rows;
  },

  findById: async (id) => {
    const query = `SELECT * FROM reservas WHERE id = $1;`;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  },

  aprobarReserva: async (id, aprobado_por_id, aprobado_por_nombre, observaciones) => {
    const reserva = await ReservaModel.findById(id);
    if (!reserva) return { error: 'Reserva no encontrada.' };

    // Verificar si en el tiempo transcurrido alguien más obtuvo aprobación para ese espacio
    const hayChoque = await ReservaModel.validarSolapamiento(reserva.recurso_id, reserva.fecha_reserva, reserva.hora_inicio, reserva.hora_fin, id);
    if (hayChoque) {
      return { error: 'No se puede aprobar la reserva. Existe otro compromiso confirmado en el mismo rango de horario.' };
    }

    const query = `
      UPDATE reservas
      SET estado_reserva = 'APROBADA',
          aprobado_por_id = $1,
          aprobado_por_nombre = $2,
          observaciones = COALESCE($3, observaciones),
          actualizado_en = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *;
    `;
    const { rows } = await db.query(query, [aprobado_por_id, aprobado_por_nombre, observaciones, id]);
    return { reserva: rows[0] };
  },

  rechazarReserva: async (id, aprobado_por_id, aprobado_por_nombre, observaciones) => {
    const query = `
      UPDATE reservas
      SET estado_reserva = 'RECHAZADA',
          aprobado_por_id = $1,
          aprobado_por_nombre = $2,
          observaciones = COALESCE($3, observaciones),
          actualizado_en = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *;
    `;
    const { rows } = await db.query(query, [aprobado_por_id, aprobado_por_nombre, observaciones, id]);
    return rows[0];
  },

  cancelarReserva: async (id, usuario_id) => {
    const query = `
      UPDATE reservas
      SET estado_reserva = 'CANCELADA',
          actualizado_en = CURRENT_TIMESTAMP
      WHERE id = $1 AND (usuario_id = $2 OR estado_reserva = 'PENDIENTE')
      RETURNING *;
    `;
    const { rows } = await db.query(query, [id, usuario_id]);
    return rows[0];
  },

  finalizarReserva: async (id) => {
    const query = `
      UPDATE reservas
      SET estado_reserva = 'FINALIZADA',
          actualizado_en = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  },

  delete: async (id) => {
    const query = `DELETE FROM reservas WHERE id = $1 RETURNING id;`;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }
};

module.exports = ReservaModel;
