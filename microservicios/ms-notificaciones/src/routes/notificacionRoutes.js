const express = require('express');
const router = express.Router();
const notificacionController = require('../controllers/notificacionController');
const authMiddleware = require('../middlewares/authMiddleware');

// Todas las rutas requieren token de autenticación JWT
router.use(authMiddleware.verifyToken);

// Obtener notificaciones del usuario autenticado (Filtro opcional: ?leida=false)
router.get('/', notificacionController.getMisNotificaciones);

// Emitir nueva notificación (Protegido: Administrativo, Administrador o peticiones de microservicios)
router.post('/', notificacionController.createNotificacion);

// Marcar todas las notificaciones del usuario como leídas
router.put('/marcar-todas-leidas', notificacionController.marcarTodasComoLeidas);

// Marcar una notificación individual como leída
router.put('/:id/marcar-leida', notificacionController.marcarComoLeida);

// Eliminar una notificación
router.delete('/:id', notificacionController.deleteNotificacion);

module.exports = router;
