const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const initDb = require('./config/initDb');
const notificacionRoutes = require('./routes/notificacionRoutes');

const app = express();
const PORT = process.env.PORT || 3007;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rutas API
app.use('/api/notificaciones', notificacionRoutes);

// Endpoint de salud
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'ms-notificaciones', database: process.env.DB_NAME || 'db_notificaciones', timestamp: new Date() });
});

// Inicializar BD y arrancar el servidor
const startServer = async () => {
  await initDb();
  app.listen(PORT, () => {
    console.log(`🚀 ms-notificaciones (Centro de Notificaciones y Alertas) corriendo en el puerto ${PORT}`);
  });
};

startServer();
