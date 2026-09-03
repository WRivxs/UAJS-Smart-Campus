const db = require('./db');

const initDb = async () => {
  try {
    console.log('🔄 Verificando e inicializando tablas en db_recursos...');

    // 1. Tabla recursos
    await db.query(`
      CREATE TABLE IF NOT EXISTS recursos (
        id SERIAL PRIMARY KEY,
        codigo VARCHAR(50) UNIQUE NOT NULL,
        nombre VARCHAR(150) NOT NULL,
        tipo VARCHAR(50) NOT NULL DEFAULT 'RECURSO_TECNOLOGICO',
        ubicacion VARCHAR(200) NOT NULL,
        estado VARCHAR(50) DEFAULT 'BUENO',
        disponibilidad BOOLEAN DEFAULT true,
        descripcion TEXT DEFAULT NULL,
        imagen_url VARCHAR(255) DEFAULT NULL,
        aforo_maximo INT DEFAULT NULL,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Tabla mantenimientos_recurso
    await db.query(`
      CREATE TABLE IF NOT EXISTS mantenimientos_recurso (
        id SERIAL PRIMARY KEY,
        recurso_id INT REFERENCES recursos(id) ON DELETE CASCADE,
        tipo_mantenimiento VARCHAR(50) NOT NULL DEFAULT 'PREVENTIVO',
        descripcion TEXT NOT NULL,
        tecnico_responsable VARCHAR(150) NOT NULL,
        fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_fin TIMESTAMP DEFAULT NULL,
        estado_mantenimiento VARCHAR(50) DEFAULT 'EN_PROCESO'
      );
    `);

    // 3. Poblar recursos semilla si la tabla está vacía
    const { rows: existingRec } = await db.query(`SELECT COUNT(*) FROM recursos;`);

    if (parseInt(existingRec[0].count) === 0) {
      console.log('🌱 Poblando catálogo de recursos semilla para el Campus Universitario...');

      const recursosSemilla = [
        {
          codigo: 'LAB-IA-01',
          nombre: 'Laboratorio de Inteligencia Artificial y Ciencia de Datos',
          tipo: 'LABORATORIO',
          ubicacion: 'Bloque B - Piso 3 (Sala B-302)',
          estado: 'BUENO',
          disponibilidad: true,
          descripcion: 'Sala equipada con 30 estaciones de trabajo GPU Nvidia RTX 4080 y tableros interactivos.',
          imagen_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
          aforo_maximo: 35
        },
        {
          codigo: 'AUD-MAGNO',
          nombre: 'Auditorio Universidad Antonio José de Sucre',
          tipo: 'ESPACIO_ACADEMICO',
          ubicacion: 'Edificio Central - Piso 1',
          estado: 'BUENO',
          disponibilidad: true,
          descripcion: 'Auditorio magno con capacidad para 250 personas, sonido surround y transmisión en directo.',
          imagen_url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=600&q=80',
          aforo_maximo: 250
        },
        {
          codigo: 'PROY-4K-01',
          nombre: 'Proyector Láser Epson 4K Profesional Portátil',
          tipo: 'EQUIPO',
          ubicacion: 'Almacén de Audiovisuales (Bloque A)',
          estado: 'BUENO',
          disponibilidad: true,
          descripcion: 'Equipo de alta luminancia (5000 lúmenes) ideal para conferencias y seminarios.',
          imagen_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
          aforo_maximo: null
        },
        {
          codigo: 'IMP-3D-02',
          nombre: 'Impresora 3D Industrial Creality K1 Max',
          tipo: 'RECURSO_TECNOLOGICO',
          ubicacion: 'Laboratorio de Prototipado y Robótica (Bloque C)',
          estado: 'EN_MANTENIMIENTO',
          disponibilidad: false,
          descripcion: 'Impresora 3D de alta velocidad para filamento PLA, ABS y Fibra de Carbono.',
          imagen_url: 'https://images.unsplash.com/photo-1631556097152-c39479bbf936?auto=format&fit=crop&w=600&q=80',
          aforo_maximo: null
        },
        {
          codigo: 'SALA-CONF-A',
          nombre: 'Sala de Conferencias e Investigación',
          tipo: 'SALA',
          ubicacion: 'Bloque Posgrados - Piso 2 (Sala A-204)',
          estado: 'BUENO',
          disponibilidad: true,
          descripcion: 'Mesa de conferencias para 18 ejecutivos con sistema de videoconferencia polycom.',
          imagen_url: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=600&q=80',
          aforo_maximo: 18
        },
        {
          codigo: 'KIT-ROBOT-01',
          nombre: 'Kit de Robótica Móvil e IoT Avanzado LEGO EV3',
          tipo: 'EQUIPO',
          ubicacion: 'Laboratorio de Mecatrónica (Bloque C)',
          estado: 'BUENO',
          disponibilidad: true,
          descripcion: 'Set completo de sensores ultrasónicos, servomotores y controladores programables.',
          imagen_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80',
          aforo_maximo: null
        }
      ];

      for (const r of recursosSemilla) {
        await db.query(`
          INSERT INTO recursos (codigo, nombre, tipo, ubicacion, estado, disponibilidad, descripcion, imagen_url, aforo_maximo)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
        `, [r.codigo, r.nombre, r.tipo, r.ubicacion, r.estado, r.disponibilidad, r.descripcion, r.imagen_url, r.aforo_maximo]);
      }

      console.log('✅ Recursos semilla poblados en el catálogo exitosamente.');
    }

    console.log('✅ Base de datos db_recursos totalmente inicializada.');
  } catch (error) {
    console.error('❌ Error al inicializar db_recursos:', error);
  }
};

module.exports = initDb;
