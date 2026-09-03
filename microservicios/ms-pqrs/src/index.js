const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const initDb = require('./config/initDb');
const pqrsRoutes = require('./routes/pqrsRoutes');

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rutas API
app.use('/api/pqrs', pqrsRoutes);

// Endpoint de salud
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'ms-pqrs', database: process.env.DB_NAME || 'db_pqrs', timestamp: new Date() });
});

// Inicializar BD y arrancar el servidor
const startServer = async () => {
  await initDb();
  app.listen(PORT, () => {
    console.log(`🚀 ms-pqrs (Peticiones, Quejas, Reclamos y Sugerencias) corriendo en el puerto ${PORT}`);
  });
};

startServer();
