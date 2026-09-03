const ReservaModel = require('../models/reservaModel');

const reservaController = {
  createReserva: async (req, res) => {
    try {
      const { recurso_id, recurso_nombre, fecha_reserva, hora_inicio, hora_fin, motivo, observaciones } = req.body;
      const { id: usuario_id, nombre: usuario_nombre, email: usuario_email } = req.user;

      if (!recurso_id || !recurso_nombre || !fecha_reserva || !hora_inicio || !hora_fin || !motivo) {
        return res.status(400).json({ error: 'recurso_id, recurso_nombre, fecha_reserva, hora_inicio, hora_fin y motivo son obligatorios.' });
      }

      const resultado = await ReservaModel.create({
        recurso_id,
        recurso_nombre,
        usuario_id,
        usuario_nombre,
        usuario_email,
        fecha_reserva,
        hora_inicio,
        hora_fin,
        motivo,
        observaciones
      });

      if (resultado.conflict) {
        return res.status(409).json({ error: resultado.message });
      }

      return res.status(201).json({
        message: 'Solicitud de reserva registrada exitosamente. Estado: PENDIENTE.',
        reserva: resultado.reserva
      });
    } catch (error) {
      console.error('Error en reservaController.createReserva:', error);
      return res.status(500).json({ error: 'Error interno al registrar la reserva.' });
    }
  },

  getReservas: async (req, res) => {
    try {
      const { recurso_id, fecha_reserva, estado_reserva } = req.query;
      const { id: usuario_id, rol_nombre } = req.user;

      const reservas = await ReservaModel.findAll({
        usuario_id,
        rol_nombre,
        recurso_id,
        fecha_reserva,
        estado_reserva
      });

      return res.json({ reservas });
    } catch (error) {
      console.error('Error en reservaController.getReservas:', error);
      return res.status(500).json({ error: 'Error al consultar las reservas.' });
    }
  },

  getReservaById: async (req, res) => {
    try {
      const { id } = req.params;
      const reserva = await ReservaModel.findById(id);

      if (!reserva) {
        return res.status(404).json({ error: 'Reserva no encontrada.' });
      }

      if (req.user.rol_nombre === 'Estudiante' && reserva.usuario_id !== req.user.id) {
        return res.status(403).json({ error: 'No tienes permiso para ver esta reserva.' });
      }

      return res.json({ reserva });
    } catch (error) {
      console.error('Error en reservaController.getReservaById:', error);
      return res.status(500).json({ error: 'Error al consultar la reserva.' });
    }
  },

  aprobarReserva: async (req, res) => {
    try {
      const { id } = req.params;
      const { observaciones } = req.body;
      const { id: aprobado_por_id, nombre: aprobado_por_nombre } = req.user;

      const resultado = await ReservaModel.aprobarReserva(id, aprobado_por_id, aprobado_por_nombre, observaciones);

      if (resultado.error) {
        return res.status(400).json({ error: resultado.error });
      }

      return res.json({ message: 'Reserva APROBADA exitosamente.', reserva: resultado.reserva });
    } catch (error) {
      console.error('Error en reservaController.aprobarReserva:', error);
      return res.status(500).json({ error: 'Error al aprobar la reserva.' });
    }
  },

  rechazarReserva: async (req, res) => {
    try {
      const { id } = req.params;
      const { observaciones } = req.body;
      const { id: aprobado_por_id, nombre: aprobado_por_nombre } = req.user;

      const actualizada = await ReservaModel.rechazarReserva(id, aprobado_por_id, aprobado_por_nombre, observaciones);
      if (!actualizada) {
        return res.status(404).json({ error: 'Reserva no encontrada.' });
      }

      return res.json({ message: 'Reserva RECHAZADA.', reserva: actualizada });
    } catch (error) {
      console.error('Error en reservaController.rechazarReserva:', error);
      return res.status(500).json({ error: 'Error al rechazar la reserva.' });
    }
  },

  cancelarReserva: async (req, res) => {
    try {
      const { id } = req.params;
      const { id: usuario_id } = req.user;

      const cancelada = await ReservaModel.cancelarReserva(id, usuario_id);
      if (!cancelada) {
        return res.status(404).json({ error: 'Reserva no encontrada o no tienes permiso para cancelarla.' });
      }

      return res.json({ message: 'Reserva CANCELADA exitosamente.', reserva: cancelada });
    } catch (error) {
      console.error('Error en reservaController.cancelarReserva:', error);
      return res.status(500).json({ error: 'Error al cancelar la reserva.' });
    }
  },

  deleteReserva: async (req, res) => {
    try {
      const { id } = req.params;
      const eliminada = await ReservaModel.delete(id);

      if (!eliminada) {
        return res.status(404).json({ error: 'Reserva no encontrada.' });
      }

      return res.json({ message: 'Reserva eliminada exitosamente.', id });
    } catch (error) {
      console.error('Error en reservaController.deleteReserva:', error);
      return res.status(500).json({ error: 'Error al eliminar la reserva.' });
    }
  }
};

module.exports = reservaController;
