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
        primer_nombre VARCHAR(50),
        segundo_nombre VARCHAR(50),
        primer_apellido VARCHAR(50),
        segundo_apellido VARCHAR(50),
        tipo_documento VARCHAR(30) DEFAULT 'CC',
        numero_documento VARCHAR(30),
        fecha_expedicion_documento DATE,
        fecha_nacimiento DATE,
        genero VARCHAR(20),
        estado_civil VARCHAR(30),
        celular VARCHAR(20),
        telefono VARCHAR(20),
        email_personal VARCHAR(150),
        facultad VARCHAR(100),
        programa_academico VARCHAR(100),
        semestre_actual INT DEFAULT 1,
        cargo VARCHAR(100),
        tipo_vinculacion VARCHAR(50),
        token_recuperacion VARCHAR(255) DEFAULT NULL,
        token_expira_en TIMESTAMP DEFAULT NULL,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Migración idempotente para columnas de perfil institucional
      ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS primer_nombre VARCHAR(50);
      ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS segundo_nombre VARCHAR(50);
      ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS primer_apellido VARCHAR(50);
      ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS segundo_apellido VARCHAR(50);
      ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS tipo_documento VARCHAR(30) DEFAULT 'CC';
      ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS numero_documento VARCHAR(30);
      ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS fecha_expedicion_documento DATE;
      ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE;
      ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS genero VARCHAR(20);
      ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS estado_civil VARCHAR(30);
      ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS celular VARCHAR(20);
      ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefono VARCHAR(20);
      ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS email_personal VARCHAR(150);
      ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS facultad VARCHAR(100);
      ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS programa_academico VARCHAR(100);
      ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS semestre_actual INT DEFAULT 1;
      ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cargo VARCHAR(100);
      ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS tipo_vinculacion VARCHAR(50);
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
          INSERT INTO usuarios (
            nombre, email, password_hash, rol_id, facultad_departamento, codigo_estudiantil,
            primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
            tipo_documento, numero_documento, fecha_expedicion_documento, fecha_nacimiento,
            genero, estado_civil, celular, telefono, email_personal,
            facultad, programa_academico, semestre_actual, cargo, tipo_vinculacion
          )
          VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, $8, $9, $10,
            $11, $12, $13, $14,
            $15, $16, $17, $18, $19,
            $20, $21, $22, $23, $24
          );
        `, [
          u.nombre, u.email, u.password_hash, u.rol_id, u.facultad_departamento, u.codigo_estudiantil,
          u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido,
          u.tipo_documento, u.numero_documento, u.fecha_expedicion_documento, u.fecha_nacimiento,
          u.genero, u.estado_civil, u.celular, u.telefono, u.email_personal,
          u.facultad, u.programa_academico, u.semestre_actual, u.cargo, u.tipo_vinculacion
        ]);
      }
      console.log('✅ Usuarios semilla creados con clave Password123!');
    } else {
      // Actualizar datos de perfil para usuarios existentes si no tienen fecha_nacimiento
      await db.query(`
        UPDATE usuarios SET 
          primer_nombre = 'Juan', segundo_nombre = 'David', primer_apellido = 'Rivas', segundo_apellido = 'Payares',
          nombre = 'Juan David Rivas Payares', tipo_documento = 'Tarjeta de Identidad', numero_documento = '1052952641',
          fecha_expedicion_documento = '2019-09-10', fecha_nacimiento = '2005-05-27', genero = 'Masculino',
          estado_civil = 'Soltero(a)', celular = '3114270335', telefono = '3114270335',
          email_personal = 'juandavid.rivas@gmail.com', facultad = 'Facultad de Ingenierías',
          programa_academico = 'Ingeniería de Sistemas', semestre_actual = 6, codigo_estudiantil = 'EST-202401'
        WHERE email = 'estudiante@uajs.edu.co' AND (fecha_nacimiento IS NULL OR primer_nombre IS NULL);

        UPDATE usuarios SET 
          primer_nombre = 'Ana', segundo_nombre = 'María', primer_apellido = 'Gómez', segundo_apellido = 'Herrera',
          nombre = 'Ana María Gómez Herrera', tipo_documento = 'Cédula de Ciudadanía', numero_documento = '45678912',
          fecha_expedicion_documento = '2008-04-12', fecha_nacimiento = '1988-11-14', genero = 'Femenino',
          estado_civil = 'Casada(o)', celular = '3001234567', telefono = '6052814500',
          email_personal = 'anamaria.gomez@gmail.com', facultad = 'Facultad de Ingenierías',
          programa_academico = 'Ingeniería de Sistemas', cargo = 'Docente Investigador',
          tipo_vinculacion = 'Tiempo Completo', codigo_estudiantil = 'DOC-102'
        WHERE email = 'docente@uajs.edu.co' AND (fecha_nacimiento IS NULL OR primer_nombre IS NULL);

        UPDATE usuarios SET 
          primer_nombre = 'Carlos', segundo_nombre = 'Arturo', primer_apellido = 'Pérez', segundo_apellido = 'Montes',
          nombre = 'Carlos Arturo Pérez Montes', tipo_documento = 'Cédula de Ciudadanía', numero_documento = '73123456',
          fecha_expedicion_documento = '2005-08-20', fecha_nacimiento = '1985-03-10', genero = 'Masculino',
          estado_civil = 'Casado(a)', celular = '3159876543', telefono = '6052814501',
          email_personal = 'carlos.perez.m@gmail.com', facultad_departamento = 'Registro y Control Académico',
          cargo = 'Coordinador de Trámites y Matrículas', codigo_estudiantil = 'ADM-205'
        WHERE email = 'administrativo@uajs.edu.co' AND (fecha_nacimiento IS NULL OR primer_nombre IS NULL);

        UPDATE usuarios SET 
          primer_nombre = 'Administrador', segundo_nombre = 'General', primer_apellido = 'UAJS', segundo_apellido = 'Campus',
          nombre = 'Administrador General del Sistema', tipo_documento = 'Cédula de Ciudadanía', numero_documento = '10000001',
          fecha_expedicion_documento = '2000-01-15', fecha_nacimiento = '1980-01-01', genero = 'Masculino',
          estado_civil = 'Casado(a)', celular = '3100000000', telefono = '6052814502',
          email_personal = 'admin.smartcampus@uajs.edu.co', facultad_departamento = 'Dirección de Tecnologías de la Información (TI)',
          cargo = 'Director de Tecnologías e Infraestructura', codigo_estudiantil = 'ADM-001'
        WHERE email = 'admin@uajs.edu.co' AND (fecha_nacimiento IS NULL OR primer_nombre IS NULL);
      `);
    }

    console.log('✅ Base de datos db_usuarios totalmente inicializada.');
  } catch (error) {
    console.error('❌ Error al inicializar db_usuarios:', error);
  }
};

module.exports = initDb;
