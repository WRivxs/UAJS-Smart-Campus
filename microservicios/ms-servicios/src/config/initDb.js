const db = require('./db');

const initDb = async () => {
  try {
    console.log('🔄 Verificando e inicializando tablas en db_servicios...');

    // 1. Crear tabla categorias_servicios
    await db.query(`
      CREATE TABLE IF NOT EXISTS categorias_servicios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) UNIQUE NOT NULL,
        descripcion TEXT,
        icono VARCHAR(50) DEFAULT 'file-text',
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Crear tabla servicios
    await db.query(`
      CREATE TABLE IF NOT EXISTS servicios (
        id SERIAL PRIMARY KEY,
        categoria_id INT REFERENCES categorias_servicios(id) ON DELETE CASCADE,
        nombre VARCHAR(150) NOT NULL,
        descripcion TEXT NOT NULL,
        requisitos TEXT,
        tiempo_respuesta_estimado VARCHAR(50) DEFAULT '24-48 horas hábiles',
        requiere_aprobacion BOOLEAN DEFAULT true,
        encargado_departamento VARCHAR(100) NOT NULL,
        estado VARCHAR(20) DEFAULT 'activo',
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Poblar Categorías Semilla
    const categoriasSemilla = [
      { nombre: 'Trámites Académicos', descripcion: 'Certificados, paz y salvo y solicitudes académicas', icono: 'file-text' },
      { nombre: 'Servicios Financieros', descripcion: 'Recibos de pago, becas y financiación', icono: 'credit-card' },
      { nombre: 'Carnetización e Identificación', descripcion: 'Emisión y reposición de carné universitario', icono: 'id-card' },
      { nombre: 'Bienestar y Deportes', descripcion: 'Servicios de salud, apoyo psicológico y eventos deportivos', icono: 'heart' },
      { nombre: 'Infraestructura y TI', descripcion: 'Acceso a salas de cómputo, red WiFi y correo institucional', icono: 'monitor' }
    ];

    for (const cat of categoriasSemilla) {
      await db.query(`
        INSERT INTO categorias_servicios (nombre, descripcion, icono)
        VALUES ($1, $2, $3)
        ON CONFLICT (nombre) DO NOTHING;
      `, [cat.nombre, cat.descripcion, cat.icono]);
    }

    // 4. Poblar Servicios Semilla si la tabla está vacía
    const { rows: existingServicios } = await db.query(`SELECT COUNT(*) FROM servicios;`);

    if (parseInt(existingServicios[0].count) === 0) {
      console.log('🌱 Poblando catálogo de servicios semilla...');
      const { rows: cats } = await db.query(`SELECT id, nombre FROM categorias_servicios;`);
      const getCatId = (nombre) => cats.find(c => c.nombre === nombre)?.id;

      const serviciosSemilla = [
        {
          categoria_id: getCatId('Trámites Académicos'),
          nombre: 'Certificado de Estudio Oficial',
          descripcion: 'Documento oficial que acredita la vinculación activa y matriculada del estudiante.',
          requisitos: 'Estar matriculado en el periodo académico vigente y no tener bloqueos financieros.',
          tiempo_respuesta_estimado: '24 horas hábiles',
          requiere_aprobacion: false,
          encargado_departamento: 'Registro y Control Académico'
        },
        {
          categoria_id: getCatId('Trámites Académicos'),
          nombre: 'Paz y Salvo Académico y Financiero',
          descripcion: 'Certificación requerida para grados o trámites administrativos externos.',
          requisitos: 'Estar al día con la biblioteca, laboratorios y tesorería.',
          tiempo_respuesta_estimado: '48 horas hábiles',
          requiere_aprobacion: true,
          encargado_departamento: 'Secretaría General'
        },
        {
          categoria_id: getCatId('Trámites Académicos'),
          nombre: 'Duplicado / Histórico de Notas',
          descripcion: 'Expedición del sábana de notas detallada de todas las asignaturas cursadas.',
          requisitos: 'Solicitud realizada desde la plataforma y pago del certificado si aplica.',
          tiempo_respuesta_estimado: '48 horas hábiles',
          requiere_aprobacion: false,
          encargado_departamento: 'Registro y Control Académico'
        },
        {
          categoria_id: getCatId('Carnetización e Identificación'),
          nombre: 'Expedición / Reposición de Carné Universitario',
          descripcion: 'Solicitud de carné físico inteligente para estudiantes, docentes y administrativos.',
          requisitos: 'Cargar fotografía tipo documento en fondo blanco y comprobante en caso de pérdida.',
          tiempo_respuesta_estimado: '3 a 5 días hábiles',
          requiere_aprobacion: true,
          encargado_departamento: 'Carnetización y Seguridad'
        },
        {
          categoria_id: getCatId('Infraestructura y TI'),
          nombre: 'Permiso de Parqueadero Vehicular / Motos',
          descripcion: 'Asignación de código QR o sticker de ingreso a los parqueaderos de la sede.',
          requisitos: 'SOAT vigente, Licencia de conducción y tarjeta de propiedad del vehículo.',
          tiempo_respuesta_estimado: '24 horas hábiles',
          requiere_aprobacion: true,
          encargado_departamento: 'Servicios Generales y Logística'
        },
        {
          categoria_id: getCatId('Bienestar y Deportes'),
          nombre: 'Atención Médica y Orientación Psicológica',
          descripcion: 'Cita prioritaria o de valoración médica / psicológica en el centro de salud de la universidad.',
          requisitos: 'Ser miembro activo de la comunidad UNiAJS.',
          tiempo_respuesta_estimado: 'Inmediata / Mismo día',
          requiere_aprobacion: false,
          encargado_departamento: 'Bienestar Universitario'
        }
      ];

      for (const s of serviciosSemilla) {
        await db.query(`
          INSERT INTO servicios (categoria_id, nombre, descripcion, requisitos, tiempo_respuesta_estimado, requiere_aprobacion, encargado_departamento)
          VALUES ($1, $2, $3, $4, $5, $6, $7);
        `, [s.categoria_id, s.nombre, s.descripcion, s.requisitos, s.tiempo_respuesta_estimado, s.requiere_aprobacion, s.encargado_departamento]);
      }
      console.log('✅ Catálogo de servicios semilla cargado exitosamente.');
    }

    console.log('✅ Base de datos db_servicios totalmente inicializada.');
  } catch (error) {
    console.error('❌ Error al inicializar db_servicios:', error);
  }
};

module.exports = initDb;
