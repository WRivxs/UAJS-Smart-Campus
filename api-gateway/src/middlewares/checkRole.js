/**
 * Middleware: checkRole
 * Fábrica de middleware: recibe un array de roles permitidos
 * y verifica que req.user.rol_nombre esté incluido.
 * 
 * Uso: router.post('/ruta', authVerify, checkRole(['Admin', 'Administrativo']), handler)
 */
const checkRole = (rolesPermitidos = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado.' });
    }

    if (!rolesPermitidos.includes(req.user.rol_nombre)) {
      return res.status(403).json({
        error: `Acceso denegado. Esta acción requiere uno de los siguientes roles: [${rolesPermitidos.join(', ')}]. Tu rol actual es: "${req.user.rol_nombre}".`
      });
    }

    next();
  };
};

module.exports = checkRole;
