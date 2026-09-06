const express = require('express');
const router = express.Router();
const eventoController = require('../controllers/eventoController');
const authMiddleware = require('../middlewares/authMiddleware');

// Todas las rutas requieren token de autenticación JWT
router.use(authMiddleware.verifyToken);

// Obtener catálogo de eventos (Filtros opcionales: ?tipo=X&estado=Y&busqueda=Z)
router.get('/', eventoController.getEventos);

// Consultar mis inscripciones a eventos
router.get('/mis-inscripciones', eventoController.getMisInscripciones);

// Obtener detalle de un evento específico y su lista de inscritos
router.get('/:id', eventoController.getEventoById);

// Registrar un nuevo evento (Protegido: Administrativo, Admin)
router.post('/', authMiddleware.checkRole(['Administrativo', 'Administrador']), eventoController.createEvento);

// Editar información del evento (Protegido: Administrativo, Admin)
router.put('/:id', authMiddleware.checkRole(['Administrativo', 'Administrador']), eventoController.updateEvento);

// Cambiar estado del evento (PROGRAMADO, EN_CURSO, FINALIZADO, CANCELADO) (Protegido: Administrativo, Admin)
router.put('/:id/estado', authMiddleware.checkRole(['Administrativo', 'Administrador']), eventoController.updateEstado);

// Inscribirse a un evento (como usuario logueado)
router.post('/:id/inscribirse', eventoController.inscribir);

// Cancelar mi inscripción a un evento
router.delete('/:id/inscripcion', eventoController.cancelarInscripcion);

// Marcar asistencia a un evento presencial (Protegido: Administrativo, Admin)
router.put('/:id/asistencia', authMiddleware.checkRole(['Administrativo', 'Administrador']), eventoController.marcarAsistencia);

// Eliminar un evento por completo (Protegido: Administrador)
router.delete('/:id', authMiddleware.checkRole(['Administrador']), eventoController.deleteEvento);

module.exports = router;
