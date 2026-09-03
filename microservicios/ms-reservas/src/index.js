const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const initDb = require('./config/initDb');
const reservaRoutes = require('./routes/reservaRoutes');

const app = express();
const PORT = process.env.PORT || 3006;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rutas API
app.use('/api/reservas', reservaRoutes);

// Endpoint de salud
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'ms-reservas', database: process.env.DB_NAME || 'db_reservas', timestamp: new Date() });
});

// Inicializar BD y arrancar el servidor
const startServer = async () => {
  await initDb();
  app.listen(PORT, () => {
    console.log(`🚀 ms-reservas (Sistema de Reservas y Control de Horarios) corriendo en el puerto ${PORT}`);
  });
};

startServer();
