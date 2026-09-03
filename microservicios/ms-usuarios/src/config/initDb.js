const db = require('./db');
const bcrypt = require('bcryptjs');

const initDb = async () => {
  try {
    console.log('🔄 Verificando e inicializando tablas completas en db_usuarios...');

    // 1. Crear tabla de roles
    await db.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(50) UNIQUE NOT NULL,
        descripcion TEXT,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Crear tabla de permisos
    await db.query(`
      CREATE TABLE IF NOT EXISTS permisos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) UNIQUE NOT NULL,
        descripcion TEXT,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Crear tabla pivote roles_permisos
    await db.query(`
      CREATE TABLE IF NOT EXISTS roles_permisos (
        rol_id INT REFERENCES roles(id) ON DELETE CASCADE,
        permiso_id INT REFERENCES permisos(id) ON DELETE CASCADE,
        PRIMARY KEY (rol_id, permiso_id)
      );
    `);

    // 4. Crear tabla de usuarios
    await db.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        rol_id INT REFERENCES roles(id) ON DELETE RESTRICT,
        facultad_departamento VARCHAR(100),
        codigo_estudiantil VARCHAR(50),
        estado VARCHAR(20) DEFAULT 'activo',
        token_recuperacion VARCHAR(255) DEFAULT NULL,
        token_expira_en TIMESTAMP DEFAULT NULL,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Insertar roles semilla
    const rolesSemilla = [
      { nombre: 'Estudiante', descripcion: 'Acceso a solicitudes, reservas, eventos y PQRS' },
      { nombre: 'Docente', descripcion: 'Acceso a solicitudes académicas, reservas de aulas y recursos' },
      { nombre: 'Administrativo', descripcion: 'Gestión y respuesta de solicitudes y trámite de PQRS' },
      { nombre: 'Administrador', descripcion: 'Control total del sistema, gestión de usuarios y asignación de roles' }
    ];

    for (const r of rolesSemilla) {
      await db.query(`
        INSERT INTO roles (nombre, descripcion)
        VALUES ($1, $2)
        ON CONFLICT (nombre) DO NOTHING;
      `, [r.nombre, r.descripcion]);
    }

    // 6. Insertar permisos semilla
    const permisosSemilla = [
      { nombre: 'crear_solicitud', descripcion: 'Crear nuevas solicitudes de trámites universitarios' },
      { nombre: 'ver_mis_solicitudes', descripcion: 'Ver historial propio de solicitudes' },
      { nombre: 'aprobar_solicitud', descripcion: 'Aprobar o rechazar solicitudes asignadas' },
      { nombre: 'crear_reserva', descripcion: 'Reservar laboratorios y auditorios' },
      { nombre: 'crear_pqrs', descripcion: 'Registrar peticiones, quejas, reclamos o sugerencias' },
      { nombre: 'responder_pqrs', descripcion: 'Responder y cerrar tickets de PQRS' },
      { nombre: 'gestionar_usuarios', descripcion: 'Crear, editar y desactivar cuentas de usuarios' },
      { nombre: 'gestionar_servicios', descripcion: 'Administrar el catálogo de servicios universitarios' }
    ];

    for (const p of permisosSemilla) {
      await db.query(`
        INSERT INTO permisos (nombre, descripcion)
        VALUES ($1, $2)
        ON CONFLICT (nombre) DO NOTHING;
      `, [p.nombre, p.descripcion]);
    }

    // 7. Asociar permisos a roles en roles_permisos
    const { rows: rolesList } = await db.query(`SELECT id, nombre FROM roles;`);
    const { rows: permisosList } = await db.query(`SELECT id, nombre FROM permisos;`);

    const getRolId = (nombre) => rolesList.find(r => r.nombre === nombre)?.id;
    const getPermisoId = (nombre) => permisosList.find(p => p.nombre === nombre)?.id;

    const asignaciones = [
      // Estudiante
      { rol: 'Estudiante', permisos: ['crear_solicitud', 'ver_mis_solicitudes', 'crear_reserva', 'crear_pqrs'] },
      // Docente
      { rol: 'Docente', permisos: ['crear_solicitud', 'ver_mis_solicitudes', 'crear_reserva', 'crear_pqrs'] },
      // Administrativo
      { rol: 'Administrativo', permisos: ['aprobar_solicitud', 'responder_pqrs', 'ver_mis_solicitudes'] },
      // Administrador
      { rol: 'Administrador', permisos: ['crear_solicitud', 'ver_mis_solicitudes', 'aprobar_solicitud', 'crear_reserva', 'crear_pqrs', 'responder_pqrs', 'gestionar_usuarios', 'gestionar_servicios'] }
    ];

    for (const item of asignaciones) {
      const rId = getRolId(item.rol);
      if (rId) {
        for (const permNombre of item.permisos) {
          const pId = getPermisoId(permNombre);
          if (pId) {
            await db.query(`
              INSERT INTO roles_permisos (rol_id, permiso_id)
              VALUES ($1, $2)
              ON CONFLICT DO NOTHING;
            `, [rId, pId]);
          }
        }
      }
    }

    // 8. Insertar usuarios semilla si la tabla está vacía
    const { rows: existingUsers } = await db.query(`SELECT COUNT(*) FROM usuarios;`);
    
    if (parseInt(existingUsers[0].count) === 0) {
      console.log('🌱 Poblando usuarios semilla...');
      const hashedPassword = await bcrypt.hash('Password123!', 10);

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
          nombre: 'Ana María Gómez',
          email: 'docente@uajs.edu.co',
          password_hash: hashedPassword,
          rol_id: getRolId('Docente'),
          facultad_departamento: 'Ingeniería de Sistemas',
          codigo_estudiantil: 'DOC-102'
        },
        {
          nombre: 'Carlos Pérez',
          email: 'administrativo@uajs.edu.co',
          password_hash: hashedPassword,
          rol_id: getRolId('Administrativo'),
          facultad_departamento: 'Registro y Control',
          codigo_estudiantil: 'ADM-205'
        },
        {
          nombre: 'Juan David Rivas',
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
      console.log('✅ Usuarios semilla creados con clave Password123!');
    }

    console.log('✅ Base de datos db_usuarios totalmente inicializada.');
  } catch (error) {
    console.error('❌ Error al inicializar db_usuarios:', error);
  }
};

module.exports = initDb;
