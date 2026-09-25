const jwt = require('jsonwebtoken');

const authMiddleware = {
  verifyToken: (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const secret = process.env.JWT_SECRET || 'uajs_smart_campus_jwt_secret_key_2026';
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        return next();
      } catch (err) {
        // Si falla la verificación del token pero vienen cabeceras validadas por el Gateway
      }
    }

    // Soporte para propagación desde el API Gateway
    if (req.headers['x-user-id']) {
      req.user = {
        id: parseInt(req.headers['x-user-id'], 10),
        rol_nombre: req.headers['x-user-rol']
      };
      return next();
    }

    return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token de autenticación válido.' });
  },

  checkRole: (rolesPermitidos = []) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Usuario no autenticado.' });
      }

      if (!rolesPermitidos.includes(req.user.rol_nombre)) {
        return res.status(403).json({ 
          error: `Acceso restringido. Se requiere uno de los siguientes roles: [${rolesPermitidos.join(', ')}]. Tu rol actual es: ${req.user.rol_nombre}` 
        });
      }

      next();
    };
  }
};

module.exports = authMiddleware;
