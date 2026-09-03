const express = require('express');
const router = express.Router();
const servicioController = require('../controllers/servicioController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rutas Públicas / Consulta
router.get('/categorias', servicioController.getCategorias);
router.get('/', servicioController.getServicios);
router.get('/:id', servicioController.getServicioById);

// Rutas Protegidas de Gestión (Administrador / Administrativo)
router.post('/categorias', authMiddleware.verifyToken, authMiddleware.checkRole(['Administrador']), servicioController.createCategoria);
router.post('/', authMiddleware.verifyToken, authMiddleware.checkRole(['Administrador', 'Administrativo']), servicioController.createServicio);
router.put('/:id', authMiddleware.verifyToken, authMiddleware.checkRole(['Administrador', 'Administrativo']), servicioController.updateServicio);
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.checkRole(['Administrador']), servicioController.deleteServicio);

module.exports = router;
