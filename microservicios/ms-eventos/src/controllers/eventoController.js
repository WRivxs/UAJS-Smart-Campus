const EventoModel = require('../models/eventoModel');

const eventoController = {
  createEvento: async (req, res) => {
    try {
      const { nombre, tipo, descripcion, fecha_inicio, fecha_fin, lugar_ubicacion, aforo_maximo, imagen_url } = req.body;
      const { id: organizador_id, nombre: organizador_nombre } = req.user;

      if (!nombre || !descripcion || !fecha_inicio || !fecha_fin || !lugar_ubicacion) {
        return res.status(400).json({ error: 'nombre, descripcion, fecha_inicio, fecha_fin y lugar_ubicacion son obligatorios.' });
      }

      const nuevoEvento = await EventoModel.create({
        nombre,
        tipo,
        descripcion,
        fecha_inicio,
        fecha_fin,
        lugar_ubicacion,
        organizador_id,
        organizador_nombre,
        aforo_maximo,
        imagen_url
      });

      return res.status(201).json({
        message: 'Evento registrado e implementado exitosamente en la agenda campus.',
        evento: nuevoEvento
      });
    } catch (error) {
      console.error('Error en eventoController.createEvento:', error);
      return res.status(500).json({ error: 'Error al crear el evento.' });
    }
  },

  getEventos: async (req, res) => {
    try {
      const { tipo, estado, busqueda } = req.query;

      const eventos = await EventoModel.findAll({
        tipo,
        estado,
        busqueda
      });

      return res.json({ eventos });
    } catch (error) {
      console.error('Error en eventoController.getEventos:', error);
      return res.status(500).json({ error: 'Error al consultar la lista de eventos.' });
    }
  },

  getEventoById: async (req, res) => {
    try {
      const { id } = req.params;
      const evento = await EventoModel.findById(id);

      if (!evento) {
        return res.status(404).json({ error: 'Evento no encontrado.' });
      }

      const inscritos = await EventoModel.findInscripcionesByEventoId(id);

      return res.json({
        evento,
        total_inscritos: inscritos.length,
        inscritos
      });
    } catch (error) {
      console.error('Error en eventoController.getEventoById:', error);
      return res.status(500).json({ error: 'Error al obtener el detalle del evento.' });
    }
  },

  inscribir: async (req, res) => {
    try {
      const { id: evento_id } = req.params;
      const { id: usuario_id, nombre: usuario_nombre, email: usuario_email } = req.user;

      const resultado = await EventoModel.inscribirUsuario(evento_id, { usuario_id, usuario_nombre, usuario_email });

      if (resultado.error) {
        return res.status(400).json({ error: resultado.error });
      }

      return res.status(201).json({
        message: 'Inscripción confirmada exitosamente.',
        inscripcion: resultado.inscripcion
      });
    } catch (error) {
      console.error('Error en eventoController.inscribir:', error);
      return res.status(500).json({ error: 'Error al procesar la inscripción.' });
    }
  },

  cancelarInscripcion: async (req, res) => {
    try {
      const { id: evento_id } = req.params;
      const { id: usuario_id } = req.user;

      const eliminada = await EventoModel.cancelarInscripcion(evento_id, usuario_id);

      if (!eliminada) {
        return res.status(404).json({ error: 'No te encuentras inscrito en este evento.' });
      }

      return res.json({ message: 'Inscripción cancelada exitosamente.', evento_id });
    } catch (error) {
      console.error('Error en eventoController.cancelarInscripcion:', error);
      return res.status(500).json({ error: 'Error al cancelar la inscripción.' });
    }
  },

  getMisInscripciones: async (req, res) => {
    try {
      const { id: usuario_id } = req.user;
      const eventos = await EventoModel.findMisInscripciones(usuario_id);

      return res.json({ mis_inscripciones: eventos });
    } catch (error) {
      console.error('Error en eventoController.getMisInscripciones:', error);
      return res.status(500).json({ error: 'Error al consultar tus inscripciones.' });
    }
  },

  updateEvento: async (req, res) => {
    try {
      const { id } = req.params;
      const evento = await EventoModel.findById(id);

      if (!evento) {
        return res.status(404).json({ error: 'Evento no encontrado.' });
      }

      const actualizado = await EventoModel.update(id, req.body);
      return res.json({ message: 'Evento actualizado exitosamente.', evento: actualizado });
    } catch (error) {
      console.error('Error en eventoController.updateEvento:', error);
      return res.status(500).json({ error: 'Error al actualizar el evento.' });
    }
  },

  updateEstado: async (req, res) => {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      const estadosValidos = ['PROGRAMADO', 'EN_CURSO', 'FINALIZADO', 'CANCELADO'];
      if (!estado || !estadosValidos.includes(estado)) {
        return res.status(400).json({ error: `El estado '${estado}' no es válido. Permitidos: [${estadosValidos.join(', ')}]` });
      }

      const actualizado = await EventoModel.updateEstado(id, estado);
      if (!actualizado) {
        return res.status(404).json({ error: 'Evento no encontrado.' });
      }

      return res.json({ message: `Estado del evento actualizado a '${estado}'.`, evento: actualizado });
    } catch (error) {
      console.error('Error en eventoController.updateEstado:', error);
      return res.status(500).json({ error: 'Error al cambiar el estado del evento.' });
    }
  },

  marcarAsistencia: async (req, res) => {
    try {
      const { id: evento_id } = req.params;
      const { usuario_id, asistio } = req.body;

      if (!usuario_id) {
        return res.status(400).json({ error: 'usuario_id es obligatorio.' });
      }

      const actualizada = await EventoModel.marcarAsistencia(evento_id, usuario_id, asistio !== undefined ? asistio : true);

      if (!actualizada) {
        return res.status(404).json({ error: 'Inscripción no encontrada para este usuario y evento.' });
      }

      return res.json({ message: 'Asistencia registrada exitosamente.', asistencia: actualizada });
    } catch (error) {
      console.error('Error en eventoController.marcarAsistencia:', error);
      return res.status(500).json({ error: 'Error al registrar la asistencia.' });
    }
  },

  deleteEvento: async (req, res) => {
    try {
      const { id } = req.params;
      const eliminado = await EventoModel.delete(id);

      if (!eliminado) {
        return res.status(404).json({ error: 'Evento no encontrado.' });
      }

      return res.json({ message: 'Evento eliminado exitosamente.', id });
    } catch (error) {
      console.error('Error en eventoController.deleteEvento:', error);
      return res.status(500).json({ error: 'Error al eliminar el evento.' });
    }
  }
};

module.exports = eventoController;
