const jwt = require('jsonwebtoken');

const authMiddleware = {
  verifyToken: (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Acceso denegado. Se requiere autenticación.' });
    }

    try {
      const secret = process.env.JWT_SECRET || 'uajs_smart_campus_jwt_secret_key_2026';
      const decoded = jwt.verify(token, secret);
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(403).json({ error: 'Token inválido o expirado.' });
    }
  },

  checkRole: (rolesPermitidos = []) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Usuario no autenticado.' });
      }

      if (!rolesPermitidos.includes(req.user.rol_nombre)) {
        return res.status(403).json({ 
          error: `Acceso denegado. Se requiere rol [${rolesPermitidos.join(', ')}]. Tu rol es: ${req.user.rol_nombre}` 
        });
      }

      next();
    };
  }
};

module.exports = authMiddleware;
