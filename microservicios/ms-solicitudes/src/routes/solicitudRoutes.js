const express = require('express');
const router = express.Router();
const solicitudController = require('../controllers/solicitudController');
const authMiddleware = require('../middlewares/authMiddleware');

// Todas las rutas de solicitudes requieren token JWT
router.use(authMiddleware.verifyToken);

// Crear nueva solicitud
router.post('/', solicitudController.createSolicitud);

// Consultar lista de solicitudes (con filtros ?estado=X&dependencia=Y)
router.get('/', solicitudController.getSolicitudes);

// Consultar detalle de solicitud + su historial de trazabilidad
router.get('/:id', solicitudController.getSolicitudById);

// Cambiar estado de solicitud + registrar en historial (Administrativo / Admin)
router.put('/:id/estado', authMiddleware.checkRole(['Administrativo', 'Administrador']), solicitudController.updateEstado);

// Asignar responsable a la solicitud (Administrativo / Admin)
router.put('/:id/asignar', authMiddleware.checkRole(['Administrativo', 'Administrador']), solicitudController.assignResponsable);

// Actualizar datos de la solicitud (Solo si está REGISTRADA o Admin)
router.put('/:id', solicitudController.updateSolicitud);

// Eliminar o cancelar solicitud
router.delete('/:id', solicitudController.deleteSolicitud);

module.exports = router;
