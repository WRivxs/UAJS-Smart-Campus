const NotificacionModel = require('../models/notificacionModel');

const notificacionController = {
  createNotificacion: async (req, res) => {
    try {
      const { usuario_id, usuario_nombre, tipo, titulo, mensaje, referencia_id, referencia_tipo } = req.body;

      if (!usuario_id || !titulo || !mensaje) {
        return res.status(400).json({ error: 'usuario_id, titulo y mensaje son obligatorios.' });
      }

      const nuevaNotificacion = await NotificacionModel.create({
        usuario_id,
        usuario_nombre,
        tipo,
        titulo,
        mensaje,
        referencia_id,
        referencia_tipo
      });

      return res.status(201).json({
        message: 'Notificación emitida exitosamente.',
        notificacion: nuevaNotificacion
      });
    } catch (error) {
      console.error('Error en notificacionController.createNotificacion:', error);
      return res.status(500).json({ error: 'Error al emitir la notificación.' });
    }
  },

  emitirDifusion: async (req, res) => {
    try {
      const { destinatarios, tipo, titulo, mensaje, referencia_id, referencia_tipo } = req.body;

      if (!destinatarios || !Array.isArray(destinatarios) || destinatarios.length === 0 || !titulo || !mensaje) {
        return res.status(400).json({ error: 'destinatarios (arreglo con objetos {id, nombre}), titulo y mensaje son obligatorios.' });
      }

      const enviadas = await NotificacionModel.createMasivo(destinatarios, {
        tipo: tipo || 'ALERTA_SISTEMA',
        titulo,
        mensaje,
        referencia_id,
        referencia_tipo
      });

      return res.status(201).json({
        message: `Difusión emitida exitosamente a ${enviadas.length} usuarios.`,
        total_enviadas: enviadas.length,
        notificaciones: enviadas
      });
    } catch (error) {
      console.error('Error en notificacionController.emitirDifusion:', error);
      return res.status(500).json({ error: 'Error al emitir la difusión masiva de notificaciones.' });
    }
  },

  getMisNotificaciones: async (req, res) => {
    try {
      const { id: usuario_id } = req.user;
      const { leida } = req.query;

      const resultado = await NotificacionModel.findByUsuarioId(usuario_id, leida);

      return res.json(resultado);
    } catch (error) {
      console.error('Error en notificacionController.getMisNotificaciones:', error);
      return res.status(500).json({ error: 'Error al consultar las notificaciones del usuario.' });
    }
  },

  marcarComoLeida: async (req, res) => {
    try {
      const { id } = req.params;
      const { id: usuario_id } = req.user;

      const actualizada = await NotificacionModel.marcarComoLeida(id, usuario_id);

      if (!actualizada) {
        return res.status(404).json({ error: 'Notificación no encontrada o no pertenece al usuario.' });
      }

      return res.json({ message: 'Notificación marcada como leída.', notificacion: actualizada });
    } catch (error) {
      console.error('Error en notificacionController.marcarComoLeida:', error);
      return res.status(500).json({ error: 'Error al actualizar la notificación.' });
    }
  },

  marcarTodasComoLeidas: async (req, res) => {
    try {
      const { id: usuario_id } = req.user;

      const totalActualizadas = await NotificacionModel.marcarTodasComoLeidas(usuario_id);

      return res.json({
        message: `Todas las notificaciones (${totalActualizadas}) han sido marcadas como leídas.`,
        total_actualizadas: totalActualizadas
      });
    } catch (error) {
      console.error('Error en notificacionController.marcarTodasComoLeidas:', error);
      return res.status(500).json({ error: 'Error al marcar notificaciones como leídas.' });
    }
  },

  deleteNotificacion: async (req, res) => {
    try {
      const { id } = req.params;
      const { id: usuario_id } = req.user;

      const eliminada = await NotificacionModel.delete(id, usuario_id);

      if (!eliminada) {
        return res.status(404).json({ error: 'Notificación no encontrada.' });
      }

      return res.json({ message: 'Notificación eliminada exitosamente.', id });
    } catch (error) {
      console.error('Error en notificacionController.deleteNotificacion:', error);
      return res.status(500).json({ error: 'Error al eliminar la notificación.' });
    }
  }
};

module.exports = notificacionController;
