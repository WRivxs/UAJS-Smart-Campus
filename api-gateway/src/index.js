const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Endpoint de verificación de salud
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'API Gateway UAJS Smart Campus', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`🚀 API Gateway corriendo en el puerto ${PORT}`);
});
