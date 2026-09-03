const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const initDb = require('./config/initDb');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Endpoint de salud
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'ms-usuarios', database: process.env.DB_NAME || 'db_usuarios', timestamp: new Date() });
});

// Inicializar BD y arrancar el servidor
const startServer = async () => {
  await initDb();
  app.listen(PORT, () => {
    console.log(`🚀 ms-usuarios (Autenticación y RBAC) corriendo en el puerto ${PORT}`);
  });
};

startServer();
