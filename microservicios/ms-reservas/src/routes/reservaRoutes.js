const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reservaController');
const authMiddleware = require('../middlewares/authMiddleware');

// Todas las rutas de reservas requieren autenticación con JWT
router.use(authMiddleware.verifyToken);

// Solicitar nueva reserva de recurso / espacio
router.post('/', reservaController.createReserva);

// Listar reservas (Estudiantes ven solo las suyas; Administrativos/Admin ven todas o por ?recurso_id=X&fecha_reserva=Y)
router.get('/', reservaController.getReservas);

// Detalle de una reserva
router.get('/:id', reservaController.getReservaById);

// Aprobar solicitud de reserva (Protegido: Administrativo, Admin)
router.put('/:id/aprobar', authMiddleware.checkRole(['Administrativo', 'Administrador']), reservaController.aprobarReserva);

// Rechazar solicitud de reserva (Protegido: Administrativo, Admin)
router.put('/:id/rechazar', authMiddleware.checkRole(['Administrativo', 'Administrador']), reservaController.rechazarReserva);

// Cancelar reserva (Creador o mientras esté PENDIENTE)
router.put('/:id/cancelar', reservaController.cancelarReserva);

// Eliminar reserva (Protegido: Administrador)
router.delete('/:id', authMiddleware.checkRole(['Administrador']), reservaController.deleteReserva);

module.exports = router;
