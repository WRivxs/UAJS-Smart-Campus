const RecursoModel = require('../models/recursoModel');

const recursoController = {
  createRecurso: async (req, res) => {
    try {
      const { codigo, nombre, tipo, ubicacion, estado, disponibilidad, descripcion, imagen_url, aforo_maximo } = req.body;

      if (!codigo || !nombre || !ubicacion) {
        return res.status(400).json({ error: 'codigo, nombre y ubicacion son obligatorios.' });
      }

      // Verificar si el código ya existe
      const existente = await RecursoModel.findByCodigo(codigo);
      if (existente) {
        return res.status(400).json({ error: `El código de recurso '${codigo}' ya está registrado.` });
      }

      const nuevoRecurso = await RecursoModel.create({
        codigo,
        nombre,
        tipo,
        ubicacion,
        estado,
        disponibilidad,
        descripcion,
        imagen_url,
        aforo_maximo
      });

      return res.status(201).json({
        message: 'Recurso registrado exitosamente en el catálogo.',
        recurso: nuevoRecurso
      });
    } catch (error) {
      console.error('Error en recursoController.createRecurso:', error);
      return res.status(500).json({ error: 'Error interno al registrar el recurso.' });
    }
  },

  getRecursos: async (req, res) => {
    try {
      const { tipo, estado, disponibilidad, busqueda } = req.query;

      const recursos = await RecursoModel.findAll({
        tipo,
        estado,
        disponibilidad,
        busqueda
      });

      return res.json({ recursos });
    } catch (error) {
      console.error('Error en recursoController.getRecursos:', error);
      return res.status(500).json({ error: 'Error al obtener el catálogo de recursos.' });
    }
  },

  getRecursoById: async (req, res) => {
    try {
      const { id } = req.params;
      const recurso = await RecursoModel.findById(id);

      if (!recurso) {
        return res.status(404).json({ error: 'Recurso no encontrado.' });
      }

      const mantenimientos = await RecursoModel.findMantenimientosByRecursoId(id);

      return res.json({
        recurso,
        mantenimientos
      });
    } catch (error) {
      console.error('Error en recursoController.getRecursoById:', error);
      return res.status(500).json({ error: 'Error al obtener el detalle del recurso.' });
    }
  },

  updateRecurso: async (req, res) => {
    try {
      const { id } = req.params;
      const recurso = await RecursoModel.findById(id);

      if (!recurso) {
        return res.status(404).json({ error: 'Recurso no encontrado.' });
      }

      const actualizado = await RecursoModel.update(id, req.body);
      return res.json({ message: 'Recurso actualizado exitosamente.', recurso: actualizado });
    } catch (error) {
      console.error('Error en recursoController.updateRecurso:', error);
      return res.status(500).json({ error: 'Error al actualizar el recurso.' });
    }
  },

  updateEstado: async (req, res) => {
    try {
      const { id } = req.params;
      const { estado, disponibilidad } = req.body;

      const estadosValidos = ['BUENO', 'DANADO', 'EN_MANTENIMIENTO'];
      if (!estado || !estadosValidos.includes(estado)) {
        return res.status(400).json({ error: `El estado '${estado}' no es válido. Estados permitidos: [${estadosValidos.join(', ')}]` });
      }

      const actualizado = await RecursoModel.updateEstado(id, estado, disponibilidad);
      if (!actualizado) {
        return res.status(404).json({ error: 'Recurso no encontrado.' });
      }

      return res.json({ message: `Estado del recurso actualizado a '${estado}'.`, recurso: actualizado });
    } catch (error) {
      console.error('Error en recursoController.updateEstado:', error);
      return res.status(500).json({ error: 'Error al cambiar el estado del recurso.' });
    }
  },

  registrarMantenimiento: async (req, res) => {
    try {
      const { id } = req.params;
      const { tipo_mantenimiento, descripcion, tecnico_responsable } = req.body;

      if (!descripcion || !tecnico_responsable) {
        return res.status(400).json({ error: 'descripcion y tecnico_responsable son obligatorios.' });
      }

      const mantenimiento = await RecursoModel.registrarMantenimiento(id, { tipo_mantenimiento, descripcion, tecnico_responsable });
      return res.status(201).json({ message: 'Ticket de mantenimiento registrado y recurso marcado como EN_MANTENIMIENTO.', mantenimiento });
    } catch (error) {
      console.error('Error en recursoController.registrarMantenimiento:', error);
      return res.status(500).json({ error: 'Error al registrar el mantenimiento.' });
    }
  },

  deleteRecurso: async (req, res) => {
    try {
      const { id } = req.params;
      const eliminado = await RecursoModel.delete(id);

      if (!eliminado) {
        return res.status(404).json({ error: 'Recurso no encontrado.' });
      }

      return res.json({ message: 'Recurso eliminado exitosamente del catálogo.', id });
    } catch (error) {
      console.error('Error en recursoController.deleteRecurso:', error);
      return res.status(500).json({ error: 'Error al eliminar el recurso.' });
    }
  }
};

module.exports = recursoController;
