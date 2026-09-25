const UserModel = require('../models/userModel');

const userController = {
  getUsers: async (req, res) => {
    try {
      const usuarios = await UserModel.findAll();
      return res.json({ usuarios });
    } catch (error) {
      console.error('Error en userController.getUsers:', error);
      return res.status(500).json({ error: 'Error al obtener la lista de usuarios.' });
    }
  },

  getUserById: async (req, res) => {
    try {
      const { id } = req.params;
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        return res.status(400).json({ error: `El ID '${id}' no es válido. Debe ser un número entero.` });
      }

      const usuario = await UserModel.findById(numericId);

      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado.' });
      }

      return res.json({ usuario });
    } catch (error) {
      console.error('Error en userController.getUserById:', error);
      return res.status(500).json({ error: 'Error al obtener el usuario.' });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const id = req.user && req.user.id;
      if (!id) {
        return res.status(401).json({ error: 'Usuario no autenticado.' });
      }

      const { nombre, facultad_departamento } = req.body;
      const updatedUser = await UserModel.update(id, { nombre, facultad_departamento });

      if (!updatedUser) {
        return res.status(404).json({ error: 'Usuario no encontrado.' });
      }

      return res.json({ 
        message: 'Perfil actualizado correctamente.', 
        usuario: updatedUser,
        user: updatedUser 
      });
    } catch (error) {
      console.error('Error en userController.updateProfile:', error);
      return res.status(500).json({ error: 'Error al actualizar el perfil.' });
    }
  },

  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        return res.status(400).json({ error: `El ID '${id}' no es válido. Debe ser un número entero.` });
      }

      const updatedUser = await UserModel.update(numericId, req.body);

      if (!updatedUser) {
        return res.status(404).json({ error: 'Usuario no encontrado o sin cambios.' });
      }

      return res.json({ message: 'Usuario actualizado correctamente.', usuario: updatedUser });
    } catch (error) {
      console.error('Error en userController.updateUser:', error);
      return res.status(500).json({ error: 'Error al actualizar el usuario.' });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        return res.status(400).json({ error: `El ID '${id}' no es válido. Debe ser un número entero.` });
      }

      const deleted = await UserModel.delete(numericId);

      if (!deleted) {
        return res.status(404).json({ error: 'Usuario no encontrado.' });
      }

      return res.json({ message: 'Usuario eliminado exitosamente.', id: numericId });
    } catch (error) {
      console.error('Error en userController.deleteUser:', error);
      return res.status(500).json({ error: 'Error al eliminar el usuario.' });
    }
  },

  getRoles: async (req, res) => {
    try {
      const roles = await UserModel.findAllRoles();
      return res.json({ roles });
    } catch (error) {
      console.error('Error en userController.getRoles:', error);
      return res.status(500).json({ error: 'Error al obtener la lista de roles.' });
    }
  }
};

module.exports = userController;
