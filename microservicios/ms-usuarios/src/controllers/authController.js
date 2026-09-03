const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

      const secret = process.env.JWT_SECRET || 'uajs_smart_campus_jwt_secret_key_2026';
      const payload = {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol_id: usuario.rol_id,
        rol_nombre: usuario.rol_nombre,
        facultad_departamento: usuario.facultad_departamento,
        codigo_estudiantil: usuario.codigo_estudiantil
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

      // Determinar rol (por defecto 'Estudiante')
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

      return res.status(201).json({
        message: 'Usuario registrado exitosamente',
        usuario: {
          ...newUser,
          rol_nombre: targetRoleName
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
      return res.json({ usuario });
    } catch (error) {
      console.error('Error en authController.getProfile:', error);
      return res.status(500).json({ error: 'Error interno al obtener el perfil.' });
    }
  }
};

module.exports = authController;
