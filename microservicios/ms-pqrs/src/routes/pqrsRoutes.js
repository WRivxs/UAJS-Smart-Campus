const express = require('express');
const router = express.Router();
const pqrsController = require('../controllers/pqrsController');
const authMiddleware = require('../middlewares/authMiddleware');

// Todas las rutas de PQRS requieren autenticación mediante JWT
router.use(authMiddleware.verifyToken);

// Crear nuevo ticket PQRS (Petición, Queja, Reclamo, Sugerencia)
router.post('/', pqrsController.createPqrs);

// Listar tickets PQRS (Estudiante ve solo los suyos; Admin/Administrativo ven todos o filtrados ?estado=X&tipo=Y)
router.get('/', pqrsController.getPqrs);

// Detalle de un ticket PQRS + sus respuestas registradas
router.get('/:id', pqrsController.getPqrsById);

// Responder ticket PQRS (Protegido: Administrativo, Admin)
router.put('/:id/responder', authMiddleware.checkRole(['Administrativo', 'Administrador']), pqrsController.responderPqrs);

// Cambiar estado del ticket PQRS (Protegido: Administrativo, Admin)
router.put('/:id/estado', authMiddleware.checkRole(['Administrativo', 'Administrador']), pqrsController.updateEstado);

// Eliminar ticket PQRS
router.delete('/:id', pqrsController.deletePqrs);

module.exports = router;
