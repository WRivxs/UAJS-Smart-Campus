const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const gatewayRoutes = require('./routes/gateway.routes');

const app = express();
const PORT = process.env.PORT || 8080;

// ─────────────────────────────────────────────────────────────────────────────
// Middlewares globales
// ─────────────────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ─────────────────────────────────────────────────────────────────────────────
// Endpoint de salud del Gateway
// ─────────────────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'API Gateway — UAJS Smart Campus',
    version: '2.0.0',
    timestamp: new Date(),
    microservicios: {
      'ms-usuarios':       process.env.MS_USUARIOS_URL      || 'http://ms-usuarios:3001',
      'ms-servicios':      process.env.MS_SERVICIOS_URL     || 'http://ms-servicios:3002',
      'ms-solicitudes':    process.env.MS_SOLICITUDES_URL   || 'http://ms-solicitudes:3003',
      'ms-pqrs':           process.env.MS_PQRS_URL          || 'http://ms-pqrs:3004',
      'ms-recursos':       process.env.MS_RECURSOS_URL      || 'http://ms-recursos:3005',
      'ms-reservas':       process.env.MS_RESERVAS_URL      || 'http://ms-reservas:3006',
      'ms-notificaciones': process.env.MS_NOTIFICACIONES_URL || 'http://ms-notificaciones:3007',
      'ms-eventos':        process.env.MS_EVENTOS_URL       || 'http://ms-eventos:3008',
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Rutas del Gateway (Proxy hacia microservicios)
// ─────────────────────────────────────────────────────────────────────────────
app.use('/api', gatewayRoutes);

// ─────────────────────────────────────────────────────────────────────────────
// Manejador de rutas no encontradas (404)
// ─────────────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Ruta '${req.method} ${req.path}' no encontrada en el API Gateway.` });
});

// ─────────────────────────────────────────────────────────────────────────────
// Arrancar servidor
// ─────────────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🛡️  API Gateway UAJS Smart Campus v2.0 corriendo en el puerto ${PORT}`);
  console.log(`🌐  Endpoint de salud: http://localhost:${PORT}/health`);
});
