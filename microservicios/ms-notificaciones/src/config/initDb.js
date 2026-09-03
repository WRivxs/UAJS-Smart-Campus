const db = require('./db');

const initDb = async () => {
  try {
    console.log('🔄 Verificando e inicializando tablas en db_notificaciones...');

    // 1. Tabla notificaciones
    await db.query(`
      CREATE TABLE IF NOT EXISTS notificaciones (
        id SERIAL PRIMARY KEY,
        usuario_id INT NOT NULL,
        usuario_nombre VARCHAR(150) DEFAULT NULL,
        tipo VARCHAR(50) NOT NULL DEFAULT 'ALERTA_SISTEMA',
        titulo VARCHAR(200) NOT NULL,
        mensaje TEXT NOT NULL,
        leida BOOLEAN DEFAULT false,
        referencia_id INT DEFAULT NULL,
        referencia_tipo VARCHAR(50) DEFAULT NULL,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_lectura TIMESTAMP DEFAULT NULL
      );
    `);

    // 2. Poblar notificaciones semilla si la tabla está vacía
    const { rows: existingNotif } = await db.query(`SELECT COUNT(*) FROM notificaciones;`);

    if (parseInt(existingNotif[0].count) === 0) {
      console.log('🌱 Poblando notificaciones semilla del sistema campus...');

      const notificacionesSemilla = [
        {
          usuario_id: 4, // Juan David Rivas (Estudiante)
          usuario_nombre: 'Juan David Rivas',
          tipo: 'CONFIRMACION_RESERVA',
          titulo: 'Reserva Aprobada: Laboratorio de Inteligencia Artificial',
          mensaje: 'Tu solicitud de reserva para el Laboratorio de IA (LAB-IA-01) el día de mañana ha sido APROBADA exitosamente.',
          leida: false,
          referencia_id: 1,
          referencia_tipo: 'reserva'
        },
        {
          usuario_id: 4, // Juan David Rivas
          usuario_nombre: 'Juan David Rivas',
          tipo: 'CAMBIO_ESTADO_SOLICITUD',
          titulo: 'Solicitud Académica en Revisión',
          mensaje: 'Tu trámite de Certificado de Notas Oficial ha cambiado al estado EN_REVISION por el departamento de Registro.',
          leida: false,
          referencia_id: 1,
          referencia_tipo: 'solicitud'
        },
        {
          usuario_id: 4, // Juan David Rivas
          usuario_nombre: 'Juan David Rivas',
          tipo: 'NUEVA_PQRS',
          titulo: 'Radicado PQRS-2026-0001 Generado',
          mensaje: 'Se ha registrado tu petición con número de radicado PQRS-2026-0001. Tiempo estimado de respuesta: 5 días hábiles.',
          leida: true,
          referencia_id: 1,
          referencia_tipo: 'pqrs'
        },
        {
          usuario_id: 2, // Ana María Gómez (Docente)
          usuario_nombre: 'Ana María Gómez',
          tipo: 'ALERTA_SISTEMA',
          titulo: 'Mantenimiento Programado de Plataforma Campus',
          mensaje: 'Le informamos a la comunidad docente que la plataforma UAJS Smart Campus estará en mantenimiento el sábado de 00:00 a 04:00.',
          leida: false,
          referencia_id: null,
          referencia_tipo: null
        }
      ];

      for (const n of notificacionesSemilla) {
        await db.query(`
          INSERT INTO notificaciones (usuario_id, usuario_nombre, tipo, titulo, mensaje, leida, referencia_id, referencia_tipo, fecha_lectura)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
        `, [
          n.usuario_id, 
          n.usuario_nombre, 
          n.tipo, 
          n.titulo, 
          n.mensaje, 
          n.leida, 
          n.referencia_id, 
          n.referencia_tipo,
          n.leida ? new Date() : null
        ]);
      }

      console.log('✅ Notificaciones semilla creadas exitosamente.');
    }

    console.log('✅ Base de datos db_notificaciones totalmente inicializada.');
  } catch (error) {
    console.error('❌ Error al inicializar db_notificaciones:', error);
  }
};

module.exports = initDb;
