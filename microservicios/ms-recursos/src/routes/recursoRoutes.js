const express = require('express');
const router = express.Router();
const recursoController = require('../controllers/recursoController');
const authMiddleware = require('../middlewares/authMiddleware');

// Todas las rutas requieren autenticación con token JWT
router.use(authMiddleware.verifyToken);

// Listar catálogo de recursos (Filtros: ?tipo=X&estado=Y&disponibilidad=true&busqueda=keyword)
router.get('/', recursoController.getRecursos);

// Obtener detalle de un recurso + historial de mantenimientos
router.get('/:id', recursoController.getRecursoById);

// Registrar nuevo recurso (Protegido: Administrativo, Admin)
router.post('/', authMiddleware.checkRole(['Administrativo', 'Administrador']), recursoController.createRecurso);

// Editar información del recurso (Protegido: Administrativo, Admin)
router.put('/:id', authMiddleware.checkRole(['Administrativo', 'Administrador']), recursoController.updateRecurso);

// Actualizar estado y disponibilidad del recurso (Protegido: Administrativo, Admin)
router.put('/:id/estado', authMiddleware.checkRole(['Administrativo', 'Administrador']), recursoController.updateEstado);

// Registrar ticket de mantenimiento para un recurso (Protegido: Administrativo, Admin)
router.post('/:id/mantenimiento', authMiddleware.checkRole(['Administrativo', 'Administrador']), recursoController.registrarMantenimiento);

// Eliminar recurso del catálogo (Protegido: Administrador)
router.delete('/:id', authMiddleware.checkRole(['Administrador']), recursoController.deleteRecurso);

module.exports = router;
