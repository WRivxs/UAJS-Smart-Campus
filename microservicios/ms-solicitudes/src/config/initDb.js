const db = require('./db');

const initDb = async () => {
  try {
    console.log('🔄 Verificando e inicializando tablas en db_solicitudes...');

    // 1. Tabla solicitudes
    await db.query(`
      CREATE TABLE IF NOT EXISTS solicitudes (
        id SERIAL PRIMARY KEY,
        usuario_id INT NOT NULL,
        usuario_nombre VARCHAR(150) NOT NULL,
        usuario_email VARCHAR(150) NOT NULL,
        servicio_id INT DEFAULT NULL,
        tipo VARCHAR(50) NOT NULL DEFAULT 'ACADEMICA',
        dependencia VARCHAR(150) NOT NULL,
        asunto VARCHAR(200) NOT NULL,
        descripcion TEXT NOT NULL,
        prioridad VARCHAR(20) DEFAULT 'MEDIA',
        responsable_id INT DEFAULT NULL,
        responsable_nombre VARCHAR(150) DEFAULT NULL,
        estado VARCHAR(50) DEFAULT 'REGISTRADA',
        observaciones TEXT DEFAULT NULL,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Tabla historial_estados_solicitud (Trazabilidad estricta)
    await db.query(`
      CREATE TABLE IF NOT EXISTS historial_estados_solicitud (
        id SERIAL PRIMARY KEY,
        solicitud_id INT REFERENCES solicitudes(id) ON DELETE CASCADE,
        estado_anterior VARCHAR(50) NOT NULL,
        estado_nuevo VARCHAR(50) NOT NULL,
        cambiado_por_id INT NOT NULL,
        cambiado_por_nombre VARCHAR(150),
        observacion TEXT,
        fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Poblar solicitudes de prueba si la tabla está vacía
    const { rows: existingSol } = await db.query(`SELECT COUNT(*) FROM solicitudes;`);

    if (parseInt(existingSol[0].count) === 0) {
      console.log('🌱 Poblando solicitudes semilla para pruebas...');

      const solicitudesSemilla = [
        {
          usuario_id: 4,
          usuario_nombre: 'Juan David Rivas',
          usuario_email: 'estudiante@uajs.edu.co',
          servicio_id: 1,
          tipo: 'ACADEMICA',
          dependencia: 'Registro y Control Académico',
          asunto: 'Solicitud de Certificado de Estudio 2026-1',
          descripcion: 'Requiero certificado de estudio con intensidad horaria para convenio de práctica profesional.',
          prioridad: 'ALTA',
          responsable_id: null,
          responsable_nombre: null,
          estado: 'REGISTRADA',
          observaciones: 'Solicitud recibida correctamente en el sistema.'
        },
        {
          usuario_id: 2,
          usuario_nombre: 'Ana María Gómez',
          usuario_email: 'docente@uajs.edu.co',
          servicio_id: 2,
          tipo: 'ADMINISTRATIVA',
          dependencia: 'Secretaría General',
          asunto: 'Paz y Salvo Académico de Investigación',
          descripcion: 'Paz y salvo institucional correspondiente a la entrega de informe de proyecto de investigación.',
          prioridad: 'MEDIA',
          responsable_id: 3,
          responsable_nombre: 'Carlos Pérez',
          estado: 'EN_REVISION',
          observaciones: 'En proceso de verificación de entrega de materiales en laboratorio.'
        },
        {
          usuario_id: 4,
          usuario_nombre: 'Juan David Rivas',
          usuario_email: 'estudiante@uajs.edu.co',
          servicio_id: 5,
          tipo: 'SERVICIO',
          dependencia: 'Servicios Generales y Logística',
          asunto: 'Asignación de Sticker de Parqueadero Vehicular',
          descripcion: 'Registro de vehículo Mazda 3 Placas ABC-123 para parqueadero del bloque B.',
          prioridad: 'BAJA',
          responsable_id: 3,
          responsable_nombre: 'Carlos Pérez',
          estado: 'EN_PROCESO',
          observaciones: 'Documentos SOAT y Licencia aprobados. Sticker pendiente de impresión.'
        },
        {
          usuario_id: 2,
          usuario_nombre: 'Ana María Gómez',
          usuario_email: 'docente@uajs.edu.co',
          servicio_id: 3,
          tipo: 'ACADEMICA',
          dependencia: 'Registro y Control Académico',
          asunto: 'Sábana de Notas Año Sabático',
          descripcion: 'Solicitud de histórico de notas autenticado para pasantía docente internacional.',
          prioridad: 'MEDIA',
          responsable_id: 1,
          responsable_nombre: 'Administrador General',
          estado: 'RESUELTA',
          observaciones: 'Certificación expedida y enviada al correo institucional del docente.'
        }
      ];

      for (const s of solicitudesSemilla) {
        const { rows } = await db.query(`
          INSERT INTO solicitudes (usuario_id, usuario_nombre, usuario_email, servicio_id, tipo, dependencia, asunto, descripcion, prioridad, responsable_id, responsable_nombre, estado, observaciones)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          RETURNING id;
        `, [s.usuario_id, s.usuario_nombre, s.usuario_email, s.servicio_id, s.tipo, s.dependencia, s.asunto, s.descripcion, s.prioridad, s.responsable_id, s.responsable_nombre, s.estado, s.observaciones]);

        const solId = rows[0].id;

        // Registrar entrada inicial en historial
        await db.query(`
          INSERT INTO historial_estados_solicitud (solicitud_id, estado_anterior, estado_nuevo, cambiado_por_id, cambiado_por_nombre, observacion)
          VALUES ($1, 'CREADO', $2, $3, $4, $5);
        `, [solId, s.estado, s.usuario_id, s.usuario_nombre, s.observaciones]);
      }

      console.log('✅ Solicitudes de prueba pobladas exitosamente.');
    }

    console.log('✅ Base de datos db_solicitudes totalmente inicializada.');
  } catch (error) {
    console.error('❌ Error al inicializar db_solicitudes:', error);
  }
};

module.exports = initDb;
