const db = require('./db');

const initDb = async () => {
  try {
    console.log('🔄 Verificando e inicializando tablas completas en db_pqrs...');

    // 1. Tabla principal pqrs (con numero_ticket radicado y fecha_limite_respuesta SLA)
    await db.query(`
      CREATE TABLE IF NOT EXISTS pqrs (
        id SERIAL PRIMARY KEY,
        numero_ticket VARCHAR(50) UNIQUE NOT NULL,
        usuario_id INT NOT NULL,
        usuario_nombre VARCHAR(150) NOT NULL,
        usuario_email VARCHAR(150) NOT NULL,
        tipo VARCHAR(50) NOT NULL DEFAULT 'PETICION',
        asunto VARCHAR(200) NOT NULL,
        descripcion TEXT NOT NULL,
        dependencia_destino VARCHAR(150) NOT NULL,
        anonimo BOOLEAN DEFAULT false,
        estado VARCHAR(50) DEFAULT 'RECIBIDA',
        respuesta TEXT DEFAULT NULL,
        fecha_respuesta TIMESTAMP DEFAULT NULL,
        fecha_limite_respuesta TIMESTAMP DEFAULT NULL,
        responsable_id INT DEFAULT NULL,
        responsable_nombre VARCHAR(150) DEFAULT NULL,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Tabla de respuestas adjuntas
    await db.query(`
      CREATE TABLE IF NOT EXISTS respuestas_pqrs (
        id SERIAL PRIMARY KEY,
        pqrs_id INT REFERENCES pqrs(id) ON DELETE CASCADE,
        respondido_por_id INT NOT NULL,
        respondido_por_nombre VARCHAR(150) NOT NULL,
        mensaje TEXT NOT NULL,
        adjunto_url VARCHAR(255) DEFAULT NULL,
        fecha_respuesta TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Poblar PQRS semilla si la tabla está vacía
    const { rows: existingPqrs } = await db.query(`SELECT COUNT(*) FROM pqrs;`);

    if (parseInt(existingPqrs[0].count) === 0) {
      console.log('🌱 Poblando PQRS semilla con número de ticket radicado...');

      const now = new Date();
      const sla15 = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
      const sla10 = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
      const sla30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const pqrsSemilla = [
        {
          numero_ticket: 'PQRS-2026-0001',
          usuario_id: 4,
          usuario_nombre: 'Juan David Rivas',
          usuario_email: 'estudiante@uajs.edu.co',
          tipo: 'PETICION',
          asunto: 'Ampliación de horario en Sala de Cómputo 302',
          descripcion: 'Solicitamos extender el horario de atención de las salas de cómputo durante la semana de parciales finales.',
          dependencia_destino: 'Infraestructura y TI',
          anonimo: false,
          estado: 'RECIBIDA',
          respuesta: null,
          fecha_respuesta: null,
          fecha_limite_respuesta: sla15,
          responsable_id: null,
          responsable_nombre: null
        },
        {
          numero_ticket: 'PQRS-2026-0002',
          usuario_id: 4,
          usuario_nombre: 'Juan David Rivas',
          usuario_email: 'estudiante@uajs.edu.co',
          tipo: 'QUEJA',
          asunto: 'Demora en trámite de validación de recibos',
          descripcion: 'Presenté el comprobante de pago el lunes y aún no ha sido reflejado en la plataforma de matrícula.',
          dependencia_destino: 'Servicios Financieros',
          anonimo: false,
          estado: 'EN_TRAMITE',
          respuesta: null,
          fecha_respuesta: null,
          fecha_limite_respuesta: sla10,
          responsable_id: 3,
          responsable_nombre: 'Carlos Pérez'
        },
        {
          numero_ticket: 'PQRS-2026-0003',
          usuario_id: 2,
          usuario_nombre: 'Ana María Gómez',
          usuario_email: 'docente@uajs.edu.co',
          tipo: 'RECLAMO',
          asunto: 'Ajuste de notas en acta de corte 2',
          descripcion: 'Reporto discrepancia en la nota registrada en el sistema versus la planilla física entregada en coordinación.',
          dependencia_destino: 'Registro y Control Académico',
          anonimo: false,
          estado: 'RESPONDIDA',
          respuesta: 'Se verificó la planilla entregada por la docente y se corrigió la nota en el sistema oficial el 02/09/2026.',
          fecha_respuesta: new Date(),
          fecha_limite_respuesta: sla10,
          responsable_id: 3,
          responsable_nombre: 'Carlos Pérez'
        },
        {
          numero_ticket: 'PQRS-2026-0004',
          usuario_id: 4,
          usuario_nombre: 'Usuario Anónimo',
          usuario_email: 'estudiante@uajs.edu.co',
          tipo: 'SUGERENCIA',
          asunto: 'Instalación de bebederos de agua en Edificio Central',
          descripcion: 'Sugerimos instalar puntos de hidratación gratuitos en el primer piso del bloque de aulas A.',
          dependencia_destino: 'Bienestar Universitario',
          anonimo: true,
          estado: 'CERRADA',
          respuesta: 'Agradecemos la sugerencia. El proyecto de bebederos fue aprobado para la vigencia del próximo semestre.',
          fecha_respuesta: new Date(),
          fecha_limite_respuesta: sla30,
          responsable_id: 1,
          responsable_nombre: 'Administrador General'
        }
      ];

      for (const p of pqrsSemilla) {
        const { rows } = await db.query(`
          INSERT INTO pqrs (numero_ticket, usuario_id, usuario_nombre, usuario_email, tipo, asunto, descripcion, dependencia_destino, anonimo, estado, respuesta, fecha_respuesta, fecha_limite_respuesta, responsable_id, responsable_nombre)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          RETURNING id;
        `, [p.numero_ticket, p.usuario_id, p.usuario_nombre, p.usuario_email, p.tipo, p.asunto, p.descripcion, p.dependencia_destino, p.anonimo, p.estado, p.respuesta, p.fecha_respuesta, p.fecha_limite_respuesta, p.responsable_id, p.responsable_nombre]);

        const pqrsId = rows[0].id;

        if (p.respuesta) {
          await db.query(`
            INSERT INTO respuestas_pqrs (pqrs_id, respondido_por_id, respondido_por_nombre, mensaje)
            VALUES ($1, $2, $3, $4);
          `, [pqrsId, p.responsable_id || 1, p.responsable_nombre || 'Administrador', p.respuesta]);
        }
      }

      console.log('✅ Registros semilla de PQRS con radicado creados exitosamente.');
    }

    console.log('✅ Base de datos db_pqrs totalmente inicializada.');
  } catch (error) {
    console.error('❌ Error al inicializar db_pqrs:', error);
  }
};

module.exports = initDb;
