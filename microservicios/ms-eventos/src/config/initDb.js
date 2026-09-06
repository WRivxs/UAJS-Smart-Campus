const db = require('./db');

const initDb = async () => {
  try {
    console.log('🔄 Verificando e inicializando tablas en db_eventos...');

    // 1. Tabla eventos
    await db.query(`
      CREATE TABLE IF NOT EXISTS eventos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(200) NOT NULL,
        tipo VARCHAR(50) NOT NULL DEFAULT 'EVENTO_ACADEMICO',
        descripcion TEXT NOT NULL,
        fecha_inicio TIMESTAMP NOT NULL,
        fecha_fin TIMESTAMP NOT NULL,
        lugar_ubicacion VARCHAR(200) NOT NULL,
        organizador_id INT NOT NULL,
        organizador_nombre VARCHAR(150) DEFAULT NULL,
        aforo_maximo INT DEFAULT NULL,
        cupos_disponibles INT DEFAULT NULL,
        imagen_url VARCHAR(255) DEFAULT NULL,
        estado VARCHAR(50) DEFAULT 'PROGRAMADO',
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Tabla inscripciones_evento
    await db.query(`
      CREATE TABLE IF NOT EXISTS inscripciones_evento (
        id SERIAL PRIMARY KEY,
        evento_id INT REFERENCES eventos(id) ON DELETE CASCADE,
        usuario_id INT NOT NULL,
        usuario_nombre VARCHAR(150) NOT NULL,
        usuario_email VARCHAR(150) NOT NULL,
        fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        asistio BOOLEAN DEFAULT false,
        UNIQUE(evento_id, usuario_id)
      );
    `);

    // 3. Poblar eventos semilla si la tabla está vacía
    const { rows: existingEv } = await db.query(`SELECT COUNT(*) FROM eventos;`);

    if (parseInt(existingEv[0].count) === 0) {
      console.log('🌱 Poblando catálogo de eventos institucionales y académicos semilla...');

      const inThreeDays = new Date();
      inThreeDays.setDate(inThreeDays.getDate() + 3);
      inThreeDays.setHours(09, 00, 00);

      const inThreeDaysEnd = new Date(inThreeDays);
      inThreeDaysEnd.setHours(17, 00, 00);

      const inFiveDays = new Date();
      inFiveDays.setDate(inFiveDays.getDate() + 5);
      inFiveDays.setHours(14, 00, 00);

      const inFiveDaysEnd = new Date(inFiveDays);
      inFiveDaysEnd.setHours(18, 00, 00);

      const eventosSemilla = [
        {
          nombre: 'Congreso Internacional de Inteligencia Artificial y Robótica 2026',
          tipo: 'CONFERENCIA',
          descripcion: 'Magno congreso con ponentes internacionales de MIT y Google DeepMind explorando el futuro de los LLMs y la robótica autónoma.',
          fecha_inicio: inThreeDays,
          fecha_fin: inThreeDaysEnd,
          lugar_ubicacion: 'Auditorio Universidad Antonio José de Sucre (AUD-MAGNO)',
          organizador_id: 1,
          organizador_nombre: 'Administrador General',
          aforo_maximo: 250,
          cupos_disponibles: 248,
          imagen_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80',
          estado: 'PROGRAMADO'
        },
        {
          nombre: 'Taller Práctico: Despliegue de Microservicios con Docker y Node.js',
          tipo: 'TALLER',
          descripcion: 'Hands-on workshop intensivo para aprender a orquestar contenedores, API Gateways y bases de datos aisladas.',
          fecha_inicio: inFiveDays,
          fecha_fin: inFiveDaysEnd,
          lugar_ubicacion: 'Laboratorio de Inteligencia Artificial (LAB-IA-01)',
          organizador_id: 2,
          organizador_nombre: 'Ana María Gómez',
          aforo_maximo: 35,
          cupos_disponibles: 33,
          imagen_url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80',
          estado: 'PROGRAMADO'
        },
        {
          nombre: 'Seminario de Metodologías Ágiles, Scrum y Liderazgo Técnico',
          tipo: 'SEMINARIO',
          descripcion: 'Seminario enfocado en la gestión eficiente de equipos de ingeniería de software e integración continua.',
          fecha_inicio: inThreeDays,
          fecha_fin: inThreeDaysEnd,
          lugar_ubicacion: 'Sala de Conferencias e Investigación (SALA-CONF-A)',
          organizador_id: 3,
          organizador_nombre: 'Carlos Pérez',
          aforo_maximo: 18,
          cupos_disponibles: 15,
          imagen_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=600&q=80',
          estado: 'PROGRAMADO'
        },
        {
          nombre: 'Feria Institucional de Innovación, Ciencia y Emprendimiento UAJS',
          tipo: 'ACTIVIDAD_INSTITUCIONAL',
          descripcion: 'Exposición de proyectos finales de grado, prototipos robóticos y startups tecnológicas universitarias.',
          fecha_inicio: inFiveDays,
          fecha_fin: inFiveDaysEnd,
          lugar_ubicacion: 'Plaza Central y Zonas Verdes del Campus',
          organizador_id: 1,
          organizador_nombre: 'Administrador General',
          aforo_maximo: 500,
          cupos_disponibles: 500,
          imagen_url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=600&q=80',
          estado: 'PROGRAMADO'
        }
      ];

      for (const e of eventosSemilla) {
        const { rows } = await db.query(`
          INSERT INTO eventos (nombre, tipo, descripcion, fecha_inicio, fecha_fin, lugar_ubicacion, organizador_id, organizador_nombre, aforo_maximo, cupos_disponibles, imagen_url, estado)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          RETURNING id;
        `, [e.nombre, e.tipo, e.descripcion, e.fecha_inicio, e.fecha_fin, e.lugar_ubicacion, e.organizador_id, e.organizador_nombre, e.aforo_maximo, e.cupos_disponibles, e.imagen_url, e.estado]);

        const eventoId = rows[0].id;

        // Registrar 2 inscripciones de prueba para los primeros eventos
        if (e.tipo === 'CONFERENCIA' || e.tipo === 'TALLER') {
          await db.query(`
            INSERT INTO inscripciones_evento (evento_id, usuario_id, usuario_nombre, usuario_email)
            VALUES ($1, $2, $3, $4), ($1, $5, $6, $7);
          `, [eventoId, 4, 'Juan David Rivas', 'estudiante@uajs.edu.co', 2, 'Ana María Gómez', 'docente@uajs.edu.co']);
        }
      }

      console.log('✅ Eventos e inscripciones semilla creados exitosamente.');
    }

    console.log('✅ Base de datos db_eventos totalmente inicializada.');
  } catch (error) {
    console.error('❌ Error al inicializar db_eventos:', error);
  }
};

module.exports = initDb;
