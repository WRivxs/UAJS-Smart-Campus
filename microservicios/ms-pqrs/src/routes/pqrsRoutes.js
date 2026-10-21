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

// Consultar ticket PQRS por código de radicado único (ej: PQRS-2026-0001)
router.get('/ticket/:numero_ticket', pqrsController.getPqrsByTicket);

// Detalle de un ticket PQRS por ID + sus respuestas registradas
router.get('/:id', pqrsController.getPqrsById);

// Responder ticket PQRS (Protegido: Administrativo, Admin)
router.put('/:id/responder', authMiddleware.checkRole(['Administrativo', 'Administrador']), pqrsController.responderPqrs);

// Replicar o solicitar aclaración a ticket PQRS (Autor del ticket o Admin)
router.post('/:id/replicar', pqrsController.replicarPqrs);

// Cambiar estado del ticket PQRS (Admin/Staff o Estudiante cerrando su propio ticket)
router.put('/:id/estado', pqrsController.updateEstado);

// Eliminar ticket PQRS
router.delete('/:id', pqrsController.deletePqrs);

module.exports = router;
