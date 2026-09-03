const db = require('./db');
const bcrypt = require('bcryptjs');

const initDb = async () => {
  try {
    console.log('🔄 Verificando e inicializando tablas en db_usuarios...');

    // 1. Crear tabla de roles
    await db.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(50) UNIQUE NOT NULL,
        descripcion TEXT,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Crear tabla de usuarios
    await db.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        rol_id INT REFERENCES roles(id) ON DELETE RESTRICT,
        facultad_departamento VARCHAR(100),
        codigo_estudiantil VARCHAR(50),
        estado VARCHAR(20) DEFAULT 'activo',
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Insertar roles semilla por defecto
    const rolesSemilla = [
      { nombre: 'Estudiante', descripcion: 'Acceso a solicitudes, reservas y eventos' },
      { nombre: 'Docente', descripcion: 'Acceso a gestión académica y solicitudes docentes' },
      { nombre: 'Administrativo', descripcion: 'Gestión y aprobación de solicitudes universitarias' },
      { nombre: 'Administrador', descripcion: 'Control total de la plataforma y asignación de roles' }
    ];

    for (const r of rolesSemilla) {
      await db.query(`
        INSERT INTO roles (nombre, descripcion)
        VALUES ($1, $2)
        ON CONFLICT (nombre) DO NOTHING;
      `, [r.nombre, r.descripcion]);
    }

    // 4. Ver si existen usuarios en la BD
    const { rows: existingUsers } = await db.query(`SELECT COUNT(*) FROM usuarios;`);
    
    if (parseInt(existingUsers[0].count) === 0) {
      console.log('🌱 Poblando usuarios semilla por defecto...');
      const hashedPassword = await bcrypt.hash('Password123!', 10);

      // Obtener IDs de roles
      const { rows: roles } = await db.query(`SELECT id, nombre FROM roles;`);
      const getRolId = (nombre) => roles.find(r => r.nombre === nombre)?.id;

      const usuariosSemilla = [
        {
          nombre: 'Administrador General',
          email: 'admin@uajs.edu.co',
          password_hash: hashedPassword,
          rol_id: getRolId('Administrador'),
          facultad_departamento: 'Dirección de Tecnología',
          codigo_estudiantil: 'ADM-001'
        },
        {
          nombre: 'Ana María Gómez (Docente)',
          email: 'docente@uajs.edu.co',
          password_hash: hashedPassword,
          rol_id: getRolId('Docente'),
          facultad_departamento: 'Ingeniería de Sistemas',
          codigo_estudiantil: 'DOC-102'
        },
        {
          nombre: 'Carlos Pérez (Administrativo)',
          email: 'administrativo@uajs.edu.co',
          password_hash: hashedPassword,
          rol_id: getRolId('Administrativo'),
          facultad_departamento: 'Registro y Control',
          codigo_estudiantil: 'ADM-205'
        },
        {
          nombre: 'Juan David Rivas (Estudiante)',
          email: 'estudiante@uajs.edu.co',
          password_hash: hashedPassword,
          rol_id: getRolId('Estudiante'),
          facultad_departamento: 'Ingeniería de Sistemas',
          codigo_estudiantil: 'EST-202401'
        }
      ];

      for (const u of usuariosSemilla) {
        await db.query(`
          INSERT INTO usuarios (nombre, email, password_hash, rol_id, facultad_departamento, codigo_estudiantil)
          VALUES ($1, $2, $3, $4, $5, $6);
        `, [u.nombre, u.email, u.password_hash, u.rol_id, u.facultad_departamento, u.codigo_estudiantil]);
      }
      console.log('✅ Usuarios semilla creados correctamente con la contraseña: Password123!');
    }

    console.log('✅ Base de datos db_usuarios lista.');
  } catch (error) {
    console.error('❌ Error al inicializar db_usuarios:', error);
  }
};

module.exports = initDb;
