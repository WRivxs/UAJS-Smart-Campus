const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const proxy = require('express-http-proxy');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// URLs de microservicios (usando nombres de servicio Docker o localhost por defecto)
const MS_USUARIOS_URL = process.env.MS_USUARIOS_URL || 'http://ms-usuarios:3001';
const MS_SERVICIOS_URL = process.env.MS_SERVICIOS_URL || 'http://ms-servicios:3002';
const MS_SOLICITUDES_URL = process.env.MS_SOLICITUDES_URL || 'http://ms-solicitudes:3003';
const MS_PQRS_URL = process.env.MS_PQRS_URL || 'http://ms-pqrs:3004';
const MS_RECURSOS_URL = process.env.MS_RECURSOS_URL || 'http://ms-recursos:3005';
const MS_RESERVAS_URL = process.env.MS_RESERVAS_URL || 'http://ms-reservas:3006';
const MS_NOTIFICACIONES_URL = process.env.MS_NOTIFICACIONES_URL || 'http://ms-notificaciones:3007';
const MS_EVENTOS_URL = process.env.MS_EVENTOS_URL || 'http://ms-eventos:3008';

// Endpoint de verificación de salud del API Gateway
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'API Gateway UAJS Smart Campus', timestamp: new Date() });
});

// Proxy Enrutador Hacia Microservicios
app.use('/api/auth', proxy(MS_USUARIOS_URL, {
  proxyReqPathResolver: (req) => `/api/auth${req.url}`
}));

app.use('/api/users', proxy(MS_USUARIOS_URL, {
  proxyReqPathResolver: (req) => `/api/users${req.url}`
}));

app.use('/api/servicios', proxy(MS_SERVICIOS_URL, {
  proxyReqPathResolver: (req) => `/api/servicios${req.url}`
}));

app.use('/api/solicitudes', proxy(MS_SOLICITUDES_URL, {
  proxyReqPathResolver: (req) => `/api/solicitudes${req.url}`
}));

app.use('/api/pqrs', proxy(MS_PQRS_URL, {
  proxyReqPathResolver: (req) => `/api/pqrs${req.url}`
}));

app.use('/api/recursos', proxy(MS_RECURSOS_URL, {
  proxyReqPathResolver: (req) => `/api/recursos${req.url}`
}));

app.use('/api/reservas', proxy(MS_RESERVAS_URL, {
  proxyReqPathResolver: (req) => `/api/reservas${req.url}`
}));

app.use('/api/notificaciones', proxy(MS_NOTIFICACIONES_URL, {
  proxyReqPathResolver: (req) => `/api/notificaciones${req.url}`
}));

app.use('/api/eventos', proxy(MS_EVENTOS_URL, {
  proxyReqPathResolver: (req) => `/api/eventos${req.url}`
}));

app.listen(PORT, () => {
  console.log(`🚀 API Gateway UAJS Smart Campus corriendo en el puerto ${PORT}`);
});
