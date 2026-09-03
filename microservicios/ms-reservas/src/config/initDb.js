const db = require('./db');

const initDb = async () => {
  try {
    console.log('🔄 Verificando e inicializando tablas en db_reservas...');

    // 1. Tabla reservas
    await db.query(`
      CREATE TABLE IF NOT EXISTS reservas (
        id SERIAL PRIMARY KEY,
        recurso_id INT NOT NULL,
        recurso_nombre VARCHAR(150) NOT NULL,
        usuario_id INT NOT NULL,
        usuario_nombre VARCHAR(150) NOT NULL,
        usuario_email VARCHAR(150) NOT NULL,
        fecha_reserva DATE NOT NULL,
        hora_inicio TIME NOT NULL,
        hora_fin TIME NOT NULL,
        motivo TEXT NOT NULL,
        estado_reserva VARCHAR(50) DEFAULT 'PENDIENTE',
        aprobado_por_id INT DEFAULT NULL,
        aprobado_por_nombre VARCHAR(150) DEFAULT NULL,
        observaciones TEXT DEFAULT NULL,
        fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Poblar reservas semilla si la tabla está vacía
    const { rows: existingRes } = await db.query(`SELECT COUNT(*) FROM reservas;`);

    if (parseInt(existingRes[0].count) === 0) {
      console.log('🌱 Poblando reservas semilla para espacios y equipos universitarios...');

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const fechaManana = tomorrow.toISOString().split('T')[0];

      const inTwoDays = new Date();
      inTwoDays.setDate(inTwoDays.getDate() + 2);
      const fechaDosDias = inTwoDays.toISOString().split('T')[0];

      const reservasSemilla = [
        {
          recurso_id: 1,
          recurso_nombre: 'Laboratorio de Inteligencia Artificial y Ciencia de Datos',
          usuario_id: 2,
          usuario_nombre: 'Ana María Gómez',
          usuario_email: 'docente@uajs.edu.co',
          fecha_reserva: fechaManana,
          hora_inicio: '08:00:00',
          hora_fin: '10:00:00',
          motivo: 'Clase magistral práctica de Redes Neuronales Profundas',
          estado_reserva: 'APROBADA',
          aprobado_por_id: 1,
          aprobado_por_nombre: 'Administrador General',
          observaciones: 'Reserva aprobada con asignación de auxiliar de laboratorio.'
        },
        {
          recurso_id: 2,
          recurso_nombre: 'Auditorio Universidad Antonio José de Sucre',
          usuario_id: 4,
          usuario_nombre: 'Juan David Rivas',
          usuario_email: 'estudiante@uajs.edu.co',
          fecha_reserva: fechaDosDias,
          hora_inicio: '14:00:00',
          hora_fin: '18:00:00',
          motivo: 'Simposio Estudiantil de Innovación Tecnológica 2026',
          estado_reserva: 'PENDIENTE',
          aprobado_por_id: null,
          aprobado_por_nombre: null,
          observaciones: 'Pendiente de aprobación por decanatura.'
        },
        {
          recurso_id: 5,
          recurso_nombre: 'Sala de Conferencias e Investigación',
          usuario_id: 3,
          usuario_nombre: 'Carlos Pérez',
          usuario_email: 'administrativo@uajs.edu.co',
          fecha_reserva: fechaManana,
          hora_inicio: '10:30:00',
          hora_fin: '12:00:00',
          motivo: 'Reunión de Consejo Administrativo Institucional',
          estado_reserva: 'APROBADA',
          aprobado_por_id: 1,
          aprobado_por_nombre: 'Administrador General',
          observaciones: 'Requiere café y agua para 15 asistentes.'
        },
        {
          recurso_id: 3,
          recurso_nombre: 'Proyector Láser Epson 4K Profesional Portátil',
          usuario_id: 4,
          usuario_nombre: 'Juan David Rivas',
          usuario_email: 'estudiante@uajs.edu.co',
          fecha_reserva: '2026-09-01',
          hora_inicio: '09:00:00',
          hora_fin: '11:00:00',
          motivo: 'Sustentación de trabajo de grado de Ingeniería de Sistemas',
          estado_reserva: 'FINALIZADA',
          aprobado_por_id: 3,
          aprobado_por_nombre: 'Carlos Pérez',
          observaciones: 'Equipo devuelto en perfectas condiciones al almacén.'
        }
      ];

      for (const r of reservasSemilla) {
        await db.query(`
          INSERT INTO reservas (recurso_id, recurso_nombre, usuario_id, usuario_nombre, usuario_email, fecha_reserva, hora_inicio, hora_fin, motivo, estado_reserva, aprobado_por_id, aprobado_por_nombre, observaciones)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);
        `, [r.recurso_id, r.recurso_nombre, r.usuario_id, r.usuario_nombre, r.usuario_email, r.fecha_reserva, r.hora_inicio, r.hora_fin, r.motivo, r.estado_reserva, r.aprobado_por_id, r.aprobado_por_nombre, r.observaciones]);
      }

      console.log('✅ Reservas semilla creadas exitosamente.');
    }

    console.log('✅ Base de datos db_reservas totalmente inicializada.');
  } catch (error) {
    console.error('❌ Error al inicializar db_reservas:', error);
  }
};

module.exports = initDb;
