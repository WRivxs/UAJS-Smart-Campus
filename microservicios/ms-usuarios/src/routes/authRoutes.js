const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rutas Públicas
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Rutas Protegidas
router.get('/verify', authMiddleware.verifyToken, authController.verifyToken);
router.get('/profile', authMiddleware.verifyToken, authController.getProfile);
router.put('/change-password', authMiddleware.verifyToken, authController.changePassword);

module.exports = router;
