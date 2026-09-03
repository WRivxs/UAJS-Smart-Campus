const ServicioModel = require('../models/servicioModel');

const servicioController = {
  getCategorias: async (req, res) => {
    try {
      const categorias = await ServicioModel.findAllCategorias();
      return res.json({ categorias });
    } catch (error) {
      console.error('Error en servicioController.getCategorias:', error);
      return res.status(500).json({ error: 'Error al obtener la lista de categorías.' });
    }
  },

  createCategoria: async (req, res) => {
    try {
      const { nombre, descripcion, icono } = req.body;
      if (!nombre) {
        return res.status(400).json({ error: 'El nombre de la categoría es obligatorio.' });
      }
      const nuevaCat = await ServicioModel.createCategoria({ nombre, descripcion, icono });
      return res.status(201).json({ message: 'Categoría creada exitosamente.', categoria: nuevaCat });
    } catch (error) {
      console.error('Error en servicioController.createCategoria:', error);
      return res.status(500).json({ error: 'Error al crear la categoría.' });
    }
  },

  getServicios: async (req, res) => {
    try {
      const { categoria_id } = req.query;
      const servicios = await ServicioModel.findAllServicios(categoria_id);
      return res.json({ servicios });
    } catch (error) {
      console.error('Error en servicioController.getServicios:', error);
      return res.status(500).json({ error: 'Error al obtener la lista de servicios.' });
    }
  },

  getServicioById: async (req, res) => {
    try {
      const { id } = req.params;
      const servicio = await ServicioModel.findById(id);

      if (!servicio) {
        return res.status(404).json({ error: 'Servicio universitario no encontrado.' });
      }

      return res.json({ servicio });
    } catch (error) {
      console.error('Error en servicioController.getServicioById:', error);
      return res.status(500).json({ error: 'Error al obtener el detalle del servicio.' });
    }
  },

  createServicio: async (req, res) => {
    try {
      const { categoria_id, nombre, descripcion, requisitos, tiempo_respuesta_estimado, requiere_aprobacion, encargado_departamento } = req.body;

      if (!categoria_id || !nombre || !descripcion || !encargado_departamento) {
        return res.status(400).json({ error: 'categoria_id, nombre, descripcion y encargado_departamento son campos obligatorios.' });
      }

      const nuevoServicio = await ServicioModel.createServicio({
        categoria_id,
        nombre,
        descripcion,
        requisitos,
        tiempo_respuesta_estimado,
        requiere_aprobacion,
        encargado_departamento
      });

      return res.status(201).json({ message: 'Servicio universitario creado exitosamente.', servicio: nuevoServicio });
    } catch (error) {
      console.error('Error en servicioController.createServicio:', error);
      return res.status(500).json({ error: 'Error al registrar el nuevo servicio.' });
    }
  },

  updateServicio: async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await ServicioModel.updateServicio(id, req.body);

      if (!updated) {
        return res.status(404).json({ error: 'Servicio no encontrado o no modificado.' });
      }

      return res.json({ message: 'Servicio actualizado correctamente.', servicio: updated });
    } catch (error) {
      console.error('Error en servicioController.updateServicio:', error);
      return res.status(500).json({ error: 'Error al actualizar el servicio.' });
    }
  },

  deleteServicio: async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await ServicioModel.deleteServicio(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Servicio no encontrado.' });
      }

      return res.json({ message: 'Servicio eliminado exitosamente.', id });
    } catch (error) {
      console.error('Error en servicioController.deleteServicio:', error);
      return res.status(500).json({ error: 'Error al eliminar el servicio.' });
    }
  }
};

module.exports = servicioController;
