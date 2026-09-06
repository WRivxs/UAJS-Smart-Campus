const jwt = require('jsonwebtoken');

/**
 * Middleware: authVerify
 * Valida el token JWT en el header Authorization.
 * Si es válido, adjunta req.user = { id, nombre, email, rol_nombre } 
 * y pasa al siguiente middleware.
 * Si es inválido o no existe, responde con error de autenticación.
 */
const authVerify = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ 
      error: 'Acceso denegado. Se requiere token de autenticación.' 
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'uajs_smart_campus_jwt_secret_key_2026';
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // { id, nombre, email, rol_nombre, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado. Por favor inicia sesión nuevamente.' });
    }
    return res.status(403).json({ error: 'Token inválido. Acceso denegado.' });
  }
};

module.exports = authVerify;
