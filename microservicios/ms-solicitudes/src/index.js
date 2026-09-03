const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const initDb = require('./config/initDb');
const solicitudRoutes = require('./routes/solicitudRoutes');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rutas API
app.use('/api/solicitudes', solicitudRoutes);

// Endpoint de salud
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'ms-solicitudes', database: process.env.DB_NAME || 'db_solicitudes', timestamp: new Date() });
});

// Inicializar BD y arrancar el servidor
const startServer = async () => {
  await initDb();
  app.listen(PORT, () => {
    console.log(`🚀 ms-solicitudes (Gestión de Solicitudes y Estados) corriendo en el puerto ${PORT}`);
  });
};

startServer();
