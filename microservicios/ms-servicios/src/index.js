const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'ms-servicios', database: process.env.DB_NAME || 'db_servicios', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`🚀 ms-servicios corriendo en el puerto ${PORT}`);
});
