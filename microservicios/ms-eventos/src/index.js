const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const initDb = require('./config/initDb');
const eventoRoutes = require('./routes/eventoRoutes');

const app = express();
const PORT = process.env.PORT || 3008;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rutas API
app.use('/api/eventos', eventoRoutes);

// Endpoint de salud
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'ms-eventos', database: process.env.DB_NAME || 'db_eventos', timestamp: new Date() });
});

// Inicializar BD y arrancar el servidor
const startServer = async () => {
  await initDb();
  app.listen(PORT, () => {
    console.log(`🚀 ms-eventos (Gestión de Eventos e Inscripciones) corriendo en el puerto ${PORT}`);
  });
};

startServer();
