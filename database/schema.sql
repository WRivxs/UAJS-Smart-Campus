-- =============================================================================
-- 🏛️ UAJS SMART CAMPUS — PLATAFORMA DISTRIBUIDA DE SERVICIOS UNIVERSITARIOS
-- ENTREGABLE 2: DDL DE BASES DE DATOS (SCHEMA CONSOLIDADO)
-- Motor: PostgreSQL 15 (Dockerizado en contenedor uajs-postgres-db)
-- Arquitectura: 8 Bases de Datos Lógicas Aisladas (Database-per-Service)
-- =============================================================================

-- =============================================================================
-- 1. BASE DE DATOS: db_usuarios (Microservicio ms-usuarios - Puerto 3001)
-- =============================================================================
\connect db_usuarios;

-- Tabla de Roles Institucionales (RBAC)
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) UNIQUE NOT NULL,
  descripcion TEXT,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Permisos del Sistema
CREATE TABLE IF NOT EXISTS permisos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) UNIQUE NOT NULL,
  descripcion TEXT,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla Intermedia Roles - Permisos
CREATE TABLE IF NOT EXISTS roles_permisos (
  rol_id INT REFERENCES roles(id) ON DELETE CASCADE,
  permiso_id INT REFERENCES permisos(id) ON DELETE CASCADE,
  PRIMARY KEY (rol_id, permiso_id)
);

-- Tabla de Usuarios con Perfil Institucional Completo
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

-- =============================================================================
-- 2. BASE DE DATOS: db_servicios (Microservicio ms-servicios - Puerto 3002)
-- =============================================================================
\connect db_servicios;

-- Categorías del Catálogo de Servicios
CREATE TABLE IF NOT EXISTS categorias_servicios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) UNIQUE NOT NULL,
  descripcion TEXT,
  icono VARCHAR(50) DEFAULT 'file-text',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Catálogo de Servicios Universitarios
CREATE TABLE IF NOT EXISTS servicios (
  id SERIAL PRIMARY KEY,
  categoria_id INT REFERENCES categorias_servicios(id) ON DELETE CASCADE,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT NOT NULL,
  icono_url VARCHAR(255) DEFAULT NULL,
  url_ruta VARCHAR(100) DEFAULT NULL,
  requisitos TEXT,
  tiempo_respuesta_estimado VARCHAR(50) DEFAULT '24-48 horas hábiles',
  requiere_aprobacion BOOLEAN DEFAULT true,
  encargado_departamento VARCHAR(100) NOT NULL,
  estado VARCHAR(20) DEFAULT 'activo',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 3. BASE DE DATOS: db_solicitudes (Microservicio ms-solicitudes - Puerto 3003)
-- =============================================================================
\connect db_solicitudes;

-- Solicitudes Académicas y Administrativas
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
  respuesta_final TEXT DEFAULT NULL,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Historial de Trazabilidad y Ciclo de Vida de Solicitudes
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

-- =============================================================================
-- 4. BASE DE DATOS: db_pqrs (Microservicio ms-pqrs - Puerto 3004)
-- =============================================================================
\connect db_pqrs;

-- Peticiones, Quejas, Reclamos y Sugerencias
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

-- Respuestas y Réplicas Oficiales de PQRS
CREATE TABLE IF NOT EXISTS respuestas_pqrs (
  id SERIAL PRIMARY KEY,
  pqrs_id INT REFERENCES pqrs(id) ON DELETE CASCADE,
  respondido_por_id INT NOT NULL,
  respondido_por_nombre VARCHAR(150) NOT NULL,
  mensaje TEXT NOT NULL,
  adjunto_url VARCHAR(255) DEFAULT NULL,
  fecha_respuesta TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 5. BASE DE DATOS: db_recursos (Microservicio ms-recursos - Puerto 3005)
-- =============================================================================
\connect db_recursos;

-- Inventario Físico de Aulas, Laboratorios y Equipos
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

-- Registro de Mantenimientos de Recursos
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

-- =============================================================================
-- 6. BASE DE DATOS: db_reservas (Microservicio ms-reservas - Puerto 3006)
-- =============================================================================
\connect db_reservas;

-- Reservaciones de Recursos y Espacios Académicos (Con Algoritmo Anti-Solapamiento)
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

-- =============================================================================
-- 7. BASE DE DATOS: db_notificaciones (Microservicio ms-notificaciones - Puerto 3007)
-- =============================================================================
\connect db_notificaciones;

-- Centro de Notificaciones y Alertas en Tiempo Real
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

-- =============================================================================
-- 8. BASE DE DATOS: db_eventos (Microservicio ms-eventos - Puerto 3008)
-- =============================================================================
\connect db_eventos;

-- Agenda de Eventos y Actividades Universitarias
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

-- Inscripciones a Eventos con Pase Digital
CREATE TABLE IF NOT EXISTS inscripciones_evento (
  id SERIAL PRIMARY KEY,
  evento_id INT REFERENCES eventos(id) ON DELETE CASCADE,
  usuario_id INT NOT NULL,
  usuario_nombre VARCHAR(150) NOT NULL,
  usuario_email VARCHAR(150) NOT NULL,
  facultad VARCHAR(100) DEFAULT NULL,
  programa VARCHAR(100) DEFAULT NULL,
  semestre INT DEFAULT NULL,
  fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  asistio BOOLEAN DEFAULT false,
  UNIQUE(evento_id, usuario_id)
);
