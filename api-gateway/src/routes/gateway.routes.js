const express = require('express');
const proxy = require('express-http-proxy');
const router = express.Router();

const authVerify = require('../middlewares/authVerify');

// URLs de los microservicios (desde variables de entorno o valores por defecto Docker)
const MS_USUARIOS_URL       = process.env.MS_USUARIOS_URL       || 'http://ms-usuarios:3001';
const MS_SERVICIOS_URL      = process.env.MS_SERVICIOS_URL      || 'http://ms-servicios:3002';
const MS_SOLICITUDES_URL    = process.env.MS_SOLICITUDES_URL    || 'http://ms-solicitudes:3003';
const MS_PQRS_URL           = process.env.MS_PQRS_URL           || 'http://ms-pqrs:3004';
const MS_RECURSOS_URL       = process.env.MS_RECURSOS_URL       || 'http://ms-recursos:3005';
const MS_RESERVAS_URL       = process.env.MS_RESERVAS_URL       || 'http://ms-reservas:3006';
const MS_NOTIFICACIONES_URL = process.env.MS_NOTIFICACIONES_URL || 'http://ms-notificaciones:3007';
const MS_EVENTOS_URL        = process.env.MS_EVENTOS_URL        || 'http://ms-eventos:3008';

const { searchSmartAllIndices } = require('../config/elasticsearch_manager');

// ─────────────────────────────────────────────────────────────────────────────
// 🔐 RUTAS PÚBLICAS — Únicamente Autenticación (Login, Recuperación)
// ─────────────────────────────────────────────────────────────────────────────
router.use('/auth', proxy(MS_USUARIOS_URL, {
  proxyReqPathResolver: (req) => `/api/auth${req.url}`
}));

// 🔍 RUTA CENTRALIZADA DE BÚSQUEDA INTELIGENTE (ELASTICSEARCH)
router.get('/search', authVerify, async (req, res) => {
  try {
    const query = req.query.q || req.query.query || '';
    if (!query) {
      return res.status(400).json({ error: 'Debes proporcionar un término de búsqueda en el parámetro ?q=' });
    }
    const resultados = await searchSmartAllIndices(query);
    res.json({
      status: 'OK',
      total: resultados.length,
      query: query,
      resultados: resultados
    });
  } catch (err) {
    res.status(500).json({ error: 'Error procesando búsqueda en Elasticsearch', detalle: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 🔒 RUTAS PROTEGIDAS — Requieren token JWT válido (authVerify) para los 8 Microservicios
// ─────────────────────────────────────────────────────────────────────────────

// 1. Usuarios y roles (CRUD usuarios, perfil, roles)
router.use('/usuarios', authVerify, proxy(MS_USUARIOS_URL, {
  proxyReqPathResolver: (req) => `/api/users${req.url}`,
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers['x-user-id']  = srcReq.user && srcReq.user.id;
    proxyReqOpts.headers['x-user-rol'] = srcReq.user && srcReq.user.rol_nombre;
    return proxyReqOpts;
  }
}));

// 2. Catálogo de servicios universitarios (Dashboard)
router.use('/servicios', authVerify, proxy(MS_SERVICIOS_URL, {
  proxyReqPathResolver: (req) => `/api/servicios${req.url}`,
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers['x-user-id']  = srcReq.user && srcReq.user.id;
    proxyReqOpts.headers['x-user-rol'] = srcReq.user && srcReq.user.rol_nombre;
    return proxyReqOpts;
  }
}));

// 3. Gestión de solicitudes y trámites
router.use('/solicitudes', authVerify, proxy(MS_SOLICITUDES_URL, {
  proxyReqPathResolver: (req) => `/api/solicitudes${req.url}`,
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers['x-user-id']  = srcReq.user && srcReq.user.id;
    proxyReqOpts.headers['x-user-rol'] = srcReq.user && srcReq.user.rol_nombre;
    return proxyReqOpts;
  }
}));

// 4. PQRS (Peticiones, Quejas, Reclamos y Sugerencias) - Protegido 100%
router.use('/pqrs', authVerify, proxy(MS_PQRS_URL, {
  proxyReqPathResolver: (req) => `/api/pqrs${req.url}`,
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers['x-user-id']  = srcReq.user && srcReq.user.id;
    proxyReqOpts.headers['x-user-rol'] = srcReq.user && srcReq.user.rol_nombre;
    return proxyReqOpts;
  }
}));

// 5. Catálogo de recursos universitarios (Equipos, Laboratorios, Espacios)
router.use('/recursos', authVerify, proxy(MS_RECURSOS_URL, {
  proxyReqPathResolver: (req) => `/api/recursos${req.url}`,
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers['x-user-id']  = srcReq.user && srcReq.user.id;
    proxyReqOpts.headers['x-user-rol'] = srcReq.user && srcReq.user.rol_nombre;
    return proxyReqOpts;
  }
}));

// 6. Sistema de reservas de recursos
router.use('/reservas', authVerify, proxy(MS_RESERVAS_URL, {
  proxyReqPathResolver: (req) => `/api/reservas${req.url}`,
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers['x-user-id']  = srcReq.user && srcReq.user.id;
    proxyReqOpts.headers['x-user-rol'] = srcReq.user && srcReq.user.rol_nombre;
    return proxyReqOpts;
  }
}));

// 7. Centro de notificaciones del usuario
router.use('/notificaciones', authVerify, proxy(MS_NOTIFICACIONES_URL, {
  proxyReqPathResolver: (req) => `/api/notificaciones${req.url}`,
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers['x-user-id']  = srcReq.user && srcReq.user.id;
    proxyReqOpts.headers['x-user-rol'] = srcReq.user && srcReq.user.rol_nombre;
    return proxyReqOpts;
  }
}));

// 8. Gestión de eventos, inscripciones y asistencia - Protegido 100%
router.use('/eventos', authVerify, proxy(MS_EVENTOS_URL, {
  proxyReqPathResolver: (req) => `/api/eventos${req.url}`,
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers['x-user-id']  = srcReq.user && srcReq.user.id;
    proxyReqOpts.headers['x-user-rol'] = srcReq.user && srcReq.user.rol_nombre;
    return proxyReqOpts;
  }
}));

module.exports = router;
