const express = require('express');
const proxy = require('express-http-proxy');
const router = express.Router();

const authVerify = require('../middlewares/authVerify');

// URLs de los microservicios (desde variables de entorno o valores por defecto Docker)
const MS_USUARIOS_URL      = process.env.MS_USUARIOS_URL      || 'http://ms-usuarios:3001';
const MS_SERVICIOS_URL     = process.env.MS_SERVICIOS_URL     || 'http://ms-servicios:3002';
const MS_SOLICITUDES_URL   = process.env.MS_SOLICITUDES_URL   || 'http://ms-solicitudes:3003';
const MS_PQRS_URL          = process.env.MS_PQRS_URL          || 'http://ms-pqrs:3004';
const MS_RECURSOS_URL      = process.env.MS_RECURSOS_URL      || 'http://ms-recursos:3005';
const MS_RESERVAS_URL      = process.env.MS_RESERVAS_URL      || 'http://ms-reservas:3006';
const MS_NOTIFICACIONES_URL = process.env.MS_NOTIFICACIONES_URL || 'http://ms-notificaciones:3007';
const MS_EVENTOS_URL       = process.env.MS_EVENTOS_URL       || 'http://ms-eventos:3008';

// ─────────────────────────────────────────────────────────────────────────────
// 🔐 RUTAS PÚBLICAS — No requieren token JWT
// ─────────────────────────────────────────────────────────────────────────────

// Autenticación (Login, recuperación de contraseña)
router.use('/auth', proxy(MS_USUARIOS_URL, {
  proxyReqPathResolver: (req) => `/api/auth${req.url}`
}));

// Consulta anónima de PQRS por número de radicado (Para usuarios sin cuenta)
router.get('/pqrs/consultar', proxy(MS_PQRS_URL, {
  proxyReqPathResolver: (req) => `/api/pqrs/consultar${req.url}`
}));

// Catálogo público de eventos (Sin inscripción)
router.get('/eventos', proxy(MS_EVENTOS_URL, {
  proxyReqPathResolver: (req) => `/api/eventos${req.url}`
}));

router.get('/eventos/:id', proxy(MS_EVENTOS_URL, {
  proxyReqPathResolver: (req) => `/api/eventos${req.url}`
}));

// ─────────────────────────────────────────────────────────────────────────────
// 🔒 RUTAS PROTEGIDAS — Requieren token JWT válido (authVerify)
// ─────────────────────────────────────────────────────────────────────────────

// Usuarios y roles (CRUD usuarios para Admin)
router.use('/usuarios', authVerify, proxy(MS_USUARIOS_URL, {
  proxyReqPathResolver: (req) => `/api/users${req.url}`,
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers['x-user-id']  = srcReq.user && srcReq.user.id;
    proxyReqOpts.headers['x-user-rol'] = srcReq.user && srcReq.user.rol_nombre;
    return proxyReqOpts;
  }
}));

// Catálogo de servicios universitarios (Dashboard)
router.use('/servicios', authVerify, proxy(MS_SERVICIOS_URL, {
  proxyReqPathResolver: (req) => `/api/servicios${req.url}`,
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers['x-user-id']  = srcReq.user && srcReq.user.id;
    proxyReqOpts.headers['x-user-rol'] = srcReq.user && srcReq.user.rol_nombre;
    return proxyReqOpts;
  }
}));

// Gestión de solicitudes y trámites
router.use('/solicitudes', authVerify, proxy(MS_SOLICITUDES_URL, {
  proxyReqPathResolver: (req) => `/api/solicitudes${req.url}`,
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers['x-user-id']  = srcReq.user && srcReq.user.id;
    proxyReqOpts.headers['x-user-rol'] = srcReq.user && srcReq.user.rol_nombre;
    return proxyReqOpts;
  }
}));

// PQRS (rutas protegidas: crear, consultar las propias, responder)
router.use('/pqrs', authVerify, proxy(MS_PQRS_URL, {
  proxyReqPathResolver: (req) => `/api/pqrs${req.url}`,
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers['x-user-id']  = srcReq.user && srcReq.user.id;
    proxyReqOpts.headers['x-user-rol'] = srcReq.user && srcReq.user.rol_nombre;
    return proxyReqOpts;
  }
}));

// Catálogo de recursos universitarios (Equipos, Laboratorios, Espacios)
router.use('/recursos', authVerify, proxy(MS_RECURSOS_URL, {
  proxyReqPathResolver: (req) => `/api/recursos${req.url}`,
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers['x-user-id']  = srcReq.user && srcReq.user.id;
    proxyReqOpts.headers['x-user-rol'] = srcReq.user && srcReq.user.rol_nombre;
    return proxyReqOpts;
  }
}));

// Sistema de reservas de recursos
router.use('/reservas', authVerify, proxy(MS_RESERVAS_URL, {
  proxyReqPathResolver: (req) => `/api/reservas${req.url}`,
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers['x-user-id']  = srcReq.user && srcReq.user.id;
    proxyReqOpts.headers['x-user-rol'] = srcReq.user && srcReq.user.rol_nombre;
    return proxyReqOpts;
  }
}));

// Centro de notificaciones del usuario
router.use('/notificaciones', authVerify, proxy(MS_NOTIFICACIONES_URL, {
  proxyReqPathResolver: (req) => `/api/notificaciones${req.url}`,
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers['x-user-id']  = srcReq.user && srcReq.user.id;
    proxyReqOpts.headers['x-user-rol'] = srcReq.user && srcReq.user.rol_nombre;
    return proxyReqOpts;
  }
}));

// Gestión de eventos, inscripciones y asistencia (Rutas protegidas)
router.use('/eventos', authVerify, proxy(MS_EVENTOS_URL, {
  proxyReqPathResolver: (req) => `/api/eventos${req.url}`,
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers['x-user-id']  = srcReq.user && srcReq.user.id;
    proxyReqOpts.headers['x-user-rol'] = srcReq.user && srcReq.user.rol_nombre;
    return proxyReqOpts;
  }
}));

module.exports = router;
