-- =============================================================================
-- 🏛️ UAJS SMART CAMPUS — PLATAFORMA DISTRIBUIDA DE SERVICIOS UNIVERSITARIOS
-- ENTREGABLE 2: DML DE DATOS SEMILLA FICTICIOS (SEED CONSOLIDADO)
-- Nota: Todos los datos son ficticios y reproducibles para propósitos académicos.
-- Clave por defecto para todos los usuarios: Password123!
-- =============================================================================

-- =============================================================================
-- 1. DATOS SEMILLA: db_usuarios
-- =============================================================================
\connect db_usuarios;

-- Roles Institucionales (RBAC)
INSERT INTO roles (id, nombre, descripcion) VALUES
  (1, 'Administrador', 'Control total del sistema, gestión de usuarios y asignación de roles'),
  (2, 'Docente', 'Acceso a solicitudes académicas, reservas de aulas y recursos'),
  (3, 'Administrativo', 'Gestión y respuesta de solicitudes y trámite de PQRS'),
  (4, 'Estudiante', 'Acceso a solicitudes, reservas, eventos y PQRS')
ON CONFLICT (id) DO NOTHING;

SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));

-- Permisos del Sistema
INSERT INTO permisos (id, nombre, descripcion) VALUES
  (1, 'crear_solicitud', 'Crear nuevas solicitudes de trámites universitarios'),
  (2, 'ver_mis_solicitudes', 'Ver historial propio de solicitudes'),
  (3, 'aprobar_solicitud', 'Aprobar o rechazar solicitudes asignadas'),
  (4, 'crear_reserva', 'Reservar laboratorios y auditorios'),
  (5, 'crear_pqrs', 'Registrar peticiones, quejas, reclamos o sugerencias'),
  (6, 'responder_pqrs', 'Responder y cerrar tickets de PQRS'),
  (7, 'gestionar_usuarios', 'Crear, editar y desactivar cuentas de usuarios'),
  (8, 'gestionar_servicios', 'Administrar el catálogo de servicios universitarios')
ON CONFLICT (id) DO NOTHING;

SELECT setval('permisos_id_seq', (SELECT MAX(id) FROM permisos));

-- Asignación Roles - Permisos
INSERT INTO roles_permisos (rol_id, permiso_id) VALUES
  (4, 1), (4, 2), (4, 4), (4, 5), -- Estudiante
  (2, 1), (2, 2), (2, 4), (2, 5), -- Docente
  (3, 2), (3, 3), (3, 6),         -- Administrativo
  (1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8) -- Administrador
ON CONFLICT DO NOTHING;

-- Usuarios Semilla (Contraseña con bcrypt: Password123!)
-- Hash: $2b$10$3zP8P0H8T8u.8O7h3m8e7.yE2r5H9Q3m0u7v1R5Z6g8Y9oH0y.9m (Password123!)
INSERT INTO usuarios (
  id, nombre, email, password_hash, rol_id, facultad_departamento, codigo_estudiantil, estado,
  primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
  tipo_documento, numero_documento, fecha_expedicion_documento, fecha_nacimiento,
  genero, estado_civil, celular, telefono, email_personal,
  facultad, programa_academico, semestre_actual, cargo, tipo_vinculacion
) VALUES
  (
    1, 'Administrador General del Sistema', 'admin@uajs.edu.co',
    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 1,
    'Dirección de Tecnologías de la Información (TI)', 'ADM-001', 'activo',
    'Administrador', 'General', 'UAJS', 'Campus',
    'Cédula de Ciudadanía', '10000001', '2000-01-15', '1980-01-01',
    'Masculino', 'Casado(a)', '3100000000', '6052814502', 'admin.smartcampus@uajs.edu.co',
    'Dirección de Tecnologías de la Información', 'Ingeniería de Sistemas', 10, 'Director de Tecnologías e Infraestructura', 'Tiempo Completo'
  ),
  (
    2, 'Ana María Gómez Herrera', 'docente@uajs.edu.co',
    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 2,
    'Facultad de Ingenierías', 'DOC-102', 'activo',
    'Ana', 'María', 'Gómez', 'Herrera',
    'Cédula de Ciudadanía', '45678912', '2008-04-12', '1988-11-14',
    'Femenino', 'Casada(o)', '3001234567', '6052814500', 'anamaria.gomez@gmail.com',
    'Facultad de Ingenierías', 'Ingeniería de Sistemas', 10, 'Docente Investigador', 'Tiempo Completo'
  ),
  (
    3, 'Carlos Arturo Pérez Montes', 'administrativo@uajs.edu.co',
    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 3,
    'Registro y Control Académico', 'ADM-205', 'activo',
    'Carlos', 'Arturo', 'Pérez', 'Montes',
    'Cédula de Ciudadanía', '73123456', '2005-08-20', '1985-03-10',
    'Masculino', 'Casado(a)', '3159876543', '6052814501', 'carlos.perez.m@gmail.com',
    'Registro y Control Académico', 'Administración de Empresas', 10, 'Coordinador de Trámites y Matrículas', 'Tiempo Completo'
  ),
  (
    4, 'Juan David Rivas Payares', 'estudiante@uajs.edu.co',
    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 4,
    'Facultad de Ingenierías', 'EST-202401', 'activo',
    'Juan', 'David', 'Rivas', 'Payares',
    'Tarjeta de Identidad', '1052952641', '2019-09-10', '2005-05-27',
    'Masculino', 'Soltero(a)', '3114270335', '3114270335', 'juandavid.rivas@gmail.com',
    'Facultad de Ingenierías', 'Ingeniería de Sistemas', 6, 'Estudiante de Pregrado', 'Estudiante Regular'
  )
ON CONFLICT (id) DO NOTHING;

SELECT setval('usuarios_id_seq', (SELECT MAX(id) FROM usuarios));

-- =============================================================================
-- 2. DATOS SEMILLA: db_servicios
-- =============================================================================
\connect db_servicios;

INSERT INTO categorias_servicios (id, nombre, descripcion, icono) VALUES
  (1, 'Trámites Académicos', 'Certificados, paz y salvo y solicitudes académicas', 'file-text'),
  (2, 'Servicios Financieros', 'Recibos de pago, becas y financiación', 'credit-card'),
  (3, 'Carnetización e Identificación', 'Emisión y reposición de carné universitario', 'id-card'),
  (4, 'Bienestar y Deportes', 'Servicios de salud, apoyo psicológico y eventos deportivos', 'heart'),
  (5, 'Infraestructura y TI', 'Acceso a salas de cómputo, red WiFi y correo institucional', 'monitor')
ON CONFLICT (id) DO NOTHING;

SELECT setval('categorias_servicios_id_seq', (SELECT MAX(id) FROM categorias_servicios));

INSERT INTO servicios (id, categoria_id, nombre, descripcion, icono_url, url_ruta, requisitos, tiempo_respuesta_estimado, requiere_aprobacion, encargado_departamento, estado) VALUES
  (1, 1, 'Certificado de Estudio Oficial', 'Documento oficial que acredita la vinculación activa y matriculada del estudiante.', 'file-text', '/solicitudes/crear?tipo=certificado_estudio', 'Estar matriculado en el periodo académico vigente y no tener bloqueos financieros.', '24 horas hábiles', false, 'Registro y Control Académico', 'activo'),
  (2, 1, 'Paz y Salvo Académico y Financiero', 'Certificación requerida para grados o trámites administrativos externos.', 'check-circle', '/solicitudes/crear?tipo=paz_y_salvo', 'Estar al día con la biblioteca, laboratorios y tesorería.', '48 horas hábiles', true, 'Secretaría General', 'activo'),
  (3, 1, 'Duplicado / Histórico de Notas', 'Expedición de la sábana de notas detallada de todas las asignaturas cursadas.', 'book-open', '/solicitudes/crear?tipo=historico_notas', 'Solicitud realizada desde la plataforma y pago del certificado si aplica.', '48 horas hábiles', false, 'Registro y Control Académico', 'activo'),
  (4, 3, 'Expedición / Reposición de Carné Universitario', 'Solicitud de carné físico inteligente para estudiantes, docentes y administrativos.', 'id-card', '/solicitudes/crear?tipo=carne_universitario', 'Foto fondo blanco formato 3x4 y documento de identidad.', '5 días hábiles', true, 'Bienestar Universitario', 'activo'),
  (5, 5, 'Reserva de Salas de Cómputo Especializadas', 'Apartado de aulas con software especializado de simulación y desarrollo.', 'monitor', '/reservas/crear?tipo=sala_computo', 'Ser estudiante activo o docente con justificación académica.', 'Inmediata', true, 'Dirección de Tecnología', 'activo')
ON CONFLICT (id) DO NOTHING;

SELECT setval('servicios_id_seq', (SELECT MAX(id) FROM servicios));

-- =============================================================================
-- 3. DATOS SEMILLA: db_solicitudes
-- =============================================================================
\connect db_solicitudes;

INSERT INTO solicitudes (id, usuario_id, usuario_nombre, usuario_email, servicio_id, tipo, dependencia, asunto, descripcion, prioridad, responsable_id, responsable_nombre, estado, observaciones, respuesta_final, fecha_registro) VALUES
  (1, 4, 'Juan David Rivas Payares', 'estudiante@uajs.edu.co', 1, 'ACADEMICA', 'Registro y Control Académico', 'Solicitud de Certificado de Estudio 2026-1', 'Requiero certificado de estudio con intensidad horaria para convenio de práctica profesional.', 'ALTA', NULL, NULL, 'REGISTRADA', 'Solicitud ingresada por el estudiante.', NULL, CURRENT_TIMESTAMP - INTERVAL '3 days'),
  (2, 2, 'Ana María Gómez Herrera', 'docente@uajs.edu.co', 2, 'ADMINISTRATIVA', 'Secretaría General', 'Paz y Salvo Académico de Investigación', 'Paz y salvo institucional correspondiente a la entrega de informe de proyecto de investigación.', 'MEDIA', 3, 'Carlos Arturo Pérez Montes', 'EN_REVISION', 'Verificando firmas en acta de cierre.', NULL, CURRENT_TIMESTAMP - INTERVAL '2 days'),
  (3, 4, 'Juan David Rivas Payares', 'estudiante@uajs.edu.co', 5, 'SERVICIO', 'Infraestructura y TI', 'Habilitación de acceso VPN a Laboratorio de Robótica', 'Solicitud de credenciales de conexión remota al cluster GPU para proyecto de grado.', 'ALTA', 3, 'Carlos Arturo Pérez Montes', 'EN_PROCESO', 'Documentos validados. En configuración técnica.', NULL, CURRENT_TIMESTAMP - INTERVAL '1 day'),
  (4, 4, 'Juan David Rivas Payares', 'estudiante@uajs.edu.co', 3, 'CERTIFICADO', 'Registro y Control Académico', 'Historial Oficial de Calificaciones Ponderadas', 'Expedición de sábana de calificaciones para postulación a beca nacional.', 'MEDIA', 3, 'Carlos Arturo Pérez Montes', 'RESUELTA', 'Trámite completado satisfactoriamente.', 'Certificado digital emitido con código de verificación QR-UAJS-9941. Descárgalo en adjunto.', CURRENT_TIMESTAMP - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

SELECT setval('solicitudes_id_seq', (SELECT MAX(id) FROM solicitudes));

-- Historial de Trazabilidad
INSERT INTO historial_estados_solicitud (solicitud_id, estado_anterior, estado_nuevo, cambiado_por_id, cambiado_por_nombre, observacion, fecha_cambio) VALUES
  (1, 'CREADA', 'REGISTRADA', 4, 'Juan David Rivas Payares', 'Radicación inicial del trámite.', CURRENT_TIMESTAMP - INTERVAL '3 days'),
  (2, 'REGISTRADA', 'EN_REVISION', 3, 'Carlos Arturo Pérez Montes', 'Inicio de revisión documental en secretaría.', CURRENT_TIMESTAMP - INTERVAL '2 days'),
  (3, 'REGISTRADA', 'EN_REVISION', 3, 'Carlos Arturo Pérez Montes', 'Asignada a soporte de TI.', CURRENT_TIMESTAMP - INTERVAL '1 day'),
  (3, 'EN_REVISION', 'EN_PROCESO', 3, 'Carlos Arturo Pérez Montes', 'Aprobado técnicamente. Configurando firewall.', CURRENT_TIMESTAMP - INTERVAL '12 hours'),
  (4, 'REGISTRADA', 'EN_REVISION', 3, 'Carlos Arturo Pérez Montes', 'Revisión de promedio ponderado.', CURRENT_TIMESTAMP - INTERVAL '4 days'),
  (4, 'EN_REVISION', 'EN_PROCESO', 3, 'Carlos Arturo Pérez Montes', 'Generación de firma electrónica institucional.', CURRENT_TIMESTAMP - INTERVAL '2 days'),
  (4, 'EN_PROCESO', 'RESUELTA', 3, 'Carlos Arturo Pérez Montes', 'Documento firmado digitalmente y emitido.', CURRENT_TIMESTAMP - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 4. DATOS SEMILLA: db_pqrs
-- =============================================================================
\connect db_pqrs;

INSERT INTO pqrs (id, numero_ticket, usuario_id, usuario_nombre, usuario_email, tipo, asunto, descripcion, dependencia_destino, anonimo, estado, respuesta, fecha_respuesta, fecha_limite_respuesta, responsable_id, responsable_nombre, fecha_registro) VALUES
  (1, 'PQRS-2026-0001', 4, 'Juan David Rivas Payares', 'estudiante@uajs.edu.co', 'PETICION', 'Ampliación de horario en Sala de Cómputo 302', 'Solicitamos extender el horario de atención de las salas de cómputo durante la semana de parciales finales.', 'Infraestructura y TI', false, 'RECIBIDA', NULL, NULL, CURRENT_TIMESTAMP + INTERVAL '15 days', NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '2 days'),
  (2, 'PQRS-2026-0002', 4, 'Juan David Rivas Payares', 'estudiante@uajs.edu.co', 'QUEJA', 'Demora en trámite de validación de recibos', 'Presenté el comprobante de pago el lunes y aún no ha sido reflejado en la plataforma de matrícula.', 'Servicios Financieros', false, 'EN_TRAMITE', NULL, NULL, CURRENT_TIMESTAMP + INTERVAL '10 days', 3, 'Carlos Arturo Pérez Montes', CURRENT_TIMESTAMP - INTERVAL '4 days'),
  (3, 'PQRS-2026-0003', 2, 'Ana María Gómez Herrera', 'docente@uajs.edu.co', 'RECLAMO', 'Ajuste de notas en acta de corte 2', 'Reporto discrepancia en la nota registrada en el sistema versus la planilla física entregada en coordinación.', 'Registro y Control Académico', false, 'RESPONDIDA', 'Se verificó la planilla física y se procedió a la corrección en el sistema institucional.', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '8 days', 3, 'Carlos Arturo Pérez Montes', CURRENT_TIMESTAMP - INTERVAL '6 days')
ON CONFLICT (id) DO NOTHING;

SELECT setval('pqrs_id_seq', (SELECT MAX(id) FROM pqrs));

-- =============================================================================
-- 5. DATOS SEMILLA: db_recursos
-- =============================================================================
\connect db_recursos;

INSERT INTO recursos (id, codigo, nombre, tipo, ubicacion, estado, disponibilidad, descripcion, imagen_url, aforo_maximo) VALUES
  (1, 'LAB-IA-01', 'Laboratorio de Inteligencia Artificial y Ciencia de Datos', 'LABORATORIO', 'Bloque B - Piso 3 (Sala B-302)', 'BUENO', true, 'Sala equipada con 30 estaciones de trabajo GPU Nvidia RTX 4080 y tableros interactivos.', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80', 35),
  (2, 'AUD-MAGNO', 'Auditorio Universidad Antonio José de Sucre', 'ESPACIO_ACADEMICO', 'Edificio Central - Piso 1', 'BUENO', true, 'Auditorio magno con capacidad para 250 personas, sonido surround y transmisión en directo.', 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=600&q=80', 250),
  (3, 'PROY-4K-01', 'Proyector Láser Epson 4K Profesional Portátil', 'EQUIPO', 'Almacén de Audiovisuales (Bloque A)', 'BUENO', true, 'Equipo de alta luminancia (5000 lúmenes) ideal para conferencias y seminarios.', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80', NULL),
  (4, 'IMP-3D-02', 'Impresora 3D Industrial Creality K1 Max', 'RECURSO_TECNOLOGICO', 'Laboratorio de Prototipado y Robótica (Bloque C)', 'EN_MANTENIMIENTO', false, 'Impresora 3D de alta velocidad para filamento PLA, ABS y Fibra de Carbono.', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80', NULL),
  (5, 'SALA-CONF-A', 'Sala de Conferencias e Investigación', 'SALA', 'Bloque Posgrados - Piso 2 (Sala A-204)', 'BUENO', true, 'Mesa de conferencias para 18 ejecutivos con sistema de videoconferencia Polycom.', 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=600&q=80', 18)
ON CONFLICT (id) DO NOTHING;

SELECT setval('recursos_id_seq', (SELECT MAX(id) FROM recursos));

-- =============================================================================
-- 6. DATOS SEMILLA: db_reservas
-- =============================================================================
\connect db_reservas;

INSERT INTO reservas (id, recurso_id, recurso_nombre, usuario_id, usuario_nombre, usuario_email, fecha_reserva, hora_inicio, hora_fin, motivo, estado_reserva, aprobado_por_id, aprobado_por_nombre, observaciones, fecha_solicitud) VALUES
  (1, 1, 'Laboratorio de Inteligencia Artificial y Ciencia de Datos', 2, 'Ana María Gómez Herrera', 'docente@uajs.edu.co', CURRENT_DATE + INTERVAL '1 day', '08:00:00', '10:00:00', 'Clase magistral práctica de Redes Neuronales Profundas', 'APROBADA', 1, 'Administrador General del Sistema', 'Reserva aprobada con asignación de auxiliar de laboratorio.', CURRENT_TIMESTAMP - INTERVAL '2 days'),
  (2, 2, 'Auditorio Universidad Antonio José de Sucre', 4, 'Juan David Rivas Payares', 'estudiante@uajs.edu.co', CURRENT_DATE + INTERVAL '2 days', '14:00:00', '18:00:00', 'Simposio Estudiantil de Innovación Tecnológica 2026', 'PENDIENTE', NULL, NULL, 'Pendiente de aprobación por decanatura.', CURRENT_TIMESTAMP - INTERVAL '1 day'),
  (3, 5, 'Sala de Conferencias e Investigación', 3, 'Carlos Arturo Pérez Montes', 'administrativo@uajs.edu.co', CURRENT_DATE + INTERVAL '1 day', '10:30:00', '12:00:00', 'Reunión de Consejo Administrativo Institucional', 'APROBADA', 1, 'Administrador General del Sistema', 'Requiere equipo de videoconferencia listo.', CURRENT_TIMESTAMP - INTERVAL '3 days'),
  (4, 3, 'Proyector Láser Epson 4K Profesional Portátil', 4, 'Juan David Rivas Payares', 'estudiante@uajs.edu.co', CURRENT_DATE - INTERVAL '5 days', '09:00:00', '11:00:00', 'Sustentación de trabajo de grado de Ingeniería de Sistemas', 'FINALIZADA', 3, 'Carlos Arturo Pérez Montes', 'Equipo devuelto a conformidad.', CURRENT_TIMESTAMP - INTERVAL '7 days')
ON CONFLICT (id) DO NOTHING;

SELECT setval('reservas_id_seq', (SELECT MAX(id) FROM reservas));

-- =============================================================================
-- 7. DATOS SEMILLA: db_notificaciones
-- =============================================================================
\connect db_notificaciones;

INSERT INTO notificaciones (id, usuario_id, usuario_nombre, tipo, titulo, mensaje, leida, referencia_id, referencia_tipo, fecha_creacion) VALUES
  (1, 4, 'Juan David Rivas Payares', 'CONFIRMACION_RESERVA', 'Reserva Aprobada: Laboratorio de Inteligencia Artificial', 'Tu solicitud de reserva para el Laboratorio de IA (LAB-IA-01) ha sido APROBADA exitosamente.', false, 1, 'reserva', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
  (2, 4, 'Juan David Rivas Payares', 'CAMBIO_ESTADO_SOLICITUD', 'Solicitud Académica en Proceso', 'Tu trámite de Certificado de Notas Oficial ha cambiado al estado EN_PROCESO por Registro y Control.', false, 3, 'solicitud', CURRENT_TIMESTAMP - INTERVAL '5 hours'),
  (3, 4, 'Juan David Rivas Payares', 'NUEVA_PQRS', 'Radicado PQRS-2026-0001 Generado', 'Se ha registrado tu petición con número de radicado PQRS-2026-0001. Tiempo estimado de respuesta: 15 días hábiles.', true, 1, 'pqrs', CURRENT_TIMESTAMP - INTERVAL '1 day'),
  (4, 4, 'Juan David Rivas Payares', 'EVENTO_NUEVO', 'Nuevo Evento: Congreso Internacional de IA 2026', 'Te invitamos a participar en el Congreso Internacional de IA en el Auditorio Magno. Cupos limitados.', true, 1, 'evento', CURRENT_TIMESTAMP - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

SELECT setval('notificaciones_id_seq', (SELECT MAX(id) FROM notificaciones));

-- =============================================================================
-- 8. DATOS SEMILLA: db_eventos
-- =============================================================================
\connect db_eventos;

INSERT INTO eventos (id, nombre, tipo, descripcion, fecha_inicio, fecha_fin, lugar_ubicacion, organizador_id, organizador_nombre, aforo_maximo, cupos_disponibles, imagen_url, estado) VALUES
  (1, 'Congreso Internacional de Inteligencia Artificial y Robótica 2026', 'CONFERENCIA', 'Magno congreso con ponentes internacionales de MIT y Google DeepMind explorando el futuro de los LLMs y la robótica autónoma.', CURRENT_TIMESTAMP + INTERVAL '3 days', CURRENT_TIMESTAMP + INTERVAL '3 days 8 hours', 'Auditorio Universidad Antonio José de Sucre (AUD-MAGNO)', 1, 'Administrador General del Sistema', 250, 248, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80', 'PROGRAMADO'),
  (2, 'Taller Práctico: Despliegue de Microservicios con Docker y Node.js', 'TALLER', 'Hands-on workshop intensivo para aprender a orquestar contenedores, API Gateways y bases de datos aisladas.', CURRENT_TIMESTAMP + INTERVAL '5 days', CURRENT_TIMESTAMP + INTERVAL '5 days 4 hours', 'Laboratorio de Inteligencia Artificial (LAB-IA-01)', 2, 'Ana María Gómez Herrera', 35, 34, 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80', 'PROGRAMADO'),
  (3, 'Feria de Empleabilidad y Pasantías Tech UAJS 2026', 'FERIA', 'Encuentro con más de 20 empresas multinacionales del sector TI para pasantías de estudiantes de últimos semestres.', CURRENT_TIMESTAMP + INTERVAL '10 days', CURRENT_TIMESTAMP + INTERVAL '10 days 6 hours', 'Plazoleta Central del Campus Universitario', 1, 'Administrador General del Sistema', 500, 480, 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80', 'PROGRAMADO')
ON CONFLICT (id) DO NOTHING;

SELECT setval('eventos_id_seq', (SELECT MAX(id) FROM eventos));

-- Inscripciones Semilla (Pase Digital)
INSERT INTO inscripciones_evento (evento_id, usuario_id, usuario_nombre, usuario_email, facultad, programa, semestre, asistio) VALUES
  (1, 4, 'Juan David Rivas Payares', 'estudiante@uajs.edu.co', 'Facultad de Ingenierías', 'Ingeniería de Sistemas', 6, false),
  (2, 4, 'Juan David Rivas Payares', 'estudiante@uajs.edu.co', 'Facultad de Ingenierías', 'Ingeniería de Sistemas', 6, false)
ON CONFLICT (evento_id, usuario_id) DO NOTHING;
