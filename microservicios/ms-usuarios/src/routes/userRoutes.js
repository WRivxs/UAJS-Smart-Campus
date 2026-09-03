const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rutas de Roles
router.get('/roles', userController.getRoles);

// Rutas de Usuarios (Protegidas)
router.use(authMiddleware.verifyToken);

// Obtener todos los usuarios (Requerido: Administrador)
router.get('/', authMiddleware.checkRole(['Administrador']), userController.getUsers);

// Obtener usuario por ID
router.get('/:id', userController.getUserById);

// Actualizar usuario (Requerido: Administrador)
router.put('/:id', authMiddleware.checkRole(['Administrador']), userController.updateUser);

// Eliminar usuario (Requerido: Administrador)
router.delete('/:id', authMiddleware.checkRole(['Administrador']), userController.deleteUser);

module.exports = router;
