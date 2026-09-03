const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const UserModel = require('../models/userModel');

const authController = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Debes proporcionar email y contraseña.' });
      }

      const usuario = await UserModel.findByEmail(email);
      if (!usuario) {
        return res.status(401).json({ error: 'Credenciales inválidas. Usuario no encontrado.' });
      }

      if (usuario.estado !== 'activo') {
        return res.status(403).json({ error: 'Tu cuenta se encuentra inactiva. Contacta al administrador.' });
      }

      const validPassword = await bcrypt.compare(password, usuario.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Credenciales inválidas. Contraseña incorrecta.' });
      }

      // Obtener lista de permisos del rol
      const permisos = await UserModel.getPermisosByRolId(usuario.rol_id);

      const secret = process.env.JWT_SECRET || 'uajs_smart_campus_jwt_secret_key_2026';
      const payload = {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol_id: usuario.rol_id,
        rol_nombre: usuario.rol_nombre,
        facultad_departamento: usuario.facultad_departamento,
        codigo_estudiantil: usuario.codigo_estudiantil,
        permisos
      };

      const token = jwt.sign(payload, secret, { expiresIn: '24h' });

      return res.json({
        message: 'Autenticación exitosa',
        token,
        usuario: payload
      });
    } catch (error) {
      console.error('Error en authController.login:', error);
      return res.status(500).json({ error: 'Error interno del servidor al procesar el login.' });
    }
  },

  register: async (req, res) => {
    try {
      const { nombre, email, password, rol_nombre, facultad_departamento, codigo_estudiantil } = req.body;

      if (!nombre || !email || !password) {
        return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios.' });
      }

      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'El correo electrónico ya se encuentra registrado.' });
      }

      const targetRoleName = rol_nombre || 'Estudiante';
      const rolObj = await UserModel.findRolByName(targetRoleName);

      if (!rolObj) {
        return res.status(400).json({ error: `El rol '${targetRoleName}' no es válido.` });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await UserModel.createUser({
        nombre,
        email,
        password_hash: hashedPassword,
        rol_id: rolObj.id,
        facultad_departamento,
        codigo_estudiantil
      });

      const permisos = await UserModel.getPermisosByRolId(rolObj.id);

      return res.status(201).json({
        message: 'Usuario registrado exitosamente',
        usuario: {
          ...newUser,
          rol_nombre: targetRoleName,
          permisos
        }
      });
    } catch (error) {
      console.error('Error en authController.register:', error);
      return res.status(500).json({ error: 'Error interno del servidor al registrar usuario.' });
    }
  },

  verifyToken: async (req, res) => {
    return res.json({
      valid: true,
      usuario: req.user
    });
  },

  getProfile: async (req, res) => {
    try {
      const usuario = await UserModel.findById(req.user.id);
      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado.' });
      }
      const permisos = await UserModel.getPermisosByRolId(usuario.rol_id);
      return res.json({ usuario: { ...usuario, permisos } });
    } catch (error) {
      console.error('Error en authController.getProfile:', error);
      return res.status(500).json({ error: 'Error interno al obtener el perfil.' });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Debes ingresar un correo electrónico.' });
      }

      const usuario = await UserModel.findByEmail(email);
      if (!usuario) {
        // Por seguridad no revelamos si existe o no
        return res.json({ message: 'Si el correo está registrado, se ha enviado un token de recuperación.' });
      }

      const tokenRecuperacion = crypto.randomBytes(20).toString('hex');
      const tokenExpiraEn = new Date(Date.now() + 3600000); // 1 hora de validez

      await UserModel.setRecoveryToken(email, tokenRecuperacion, tokenExpiraEn);

      return res.json({
        message: 'Token de recuperación generado exitosamente.',
        token_recuperacion: tokenRecuperacion,
        instrucciones: 'Utiliza este token en el endpoint /api/auth/reset-password para definir tu nueva contraseña.'
      });
    } catch (error) {
      console.error('Error en authController.forgotPassword:', error);
      return res.status(500).json({ error: 'Error al procesar la solicitud de recuperación.' });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ error: 'El token y la nueva contraseña son requeridos.' });
      }

      const usuario = await UserModel.findByRecoveryToken(token);
      if (!usuario) {
        return res.status(400).json({ error: 'El token de recuperación es inválido o ha expirado.' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await UserModel.updatePassword(usuario.id, hashedPassword);

      return res.json({ message: 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión.' });
    } catch (error) {
      console.error('Error en authController.resetPassword:', error);
      return res.status(500).json({ error: 'Error al restablecer la contraseña.' });
    }
  },

  changePassword: async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      const userId = req.user.id;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: 'La contraseña actual y la nueva contraseña son requeridas.' });
      }

      const usuario = await UserModel.findByEmail(req.user.email);
      const validPassword = await bcrypt.compare(oldPassword, usuario.password_hash);
      
      if (!validPassword) {
        return res.status(401).json({ error: 'La contraseña actual es incorrecta.' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await UserModel.updatePassword(userId, hashedPassword);

      return res.json({ message: 'Contraseña actualizada correctamente.' });
    } catch (error) {
      console.error('Error en authController.changePassword:', error);
      return res.status(500).json({ error: 'Error al cambiar la contraseña.' });
    }
  }
};

module.exports = authController;
