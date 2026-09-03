const SolicitudModel = require('../models/solicitudModel');

const solicitudController = {
  createSolicitud: async (req, res) => {
    try {
      const { servicio_id, tipo, dependencia, asunto, descripcion, prioridad, observaciones } = req.body;
      const { id: usuario_id, nombre: usuario_nombre, email: usuario_email } = req.user;

      if (!dependencia || !asunto || !descripcion) {
        return res.status(400).json({ error: 'dependencia, asunto y descripcion son obligatorios.' });
      }

      const nuevaSolicitud = await SolicitudModel.create({
        usuario_id,
        usuario_nombre,
        usuario_email,
        servicio_id,
        tipo,
        dependencia,
        asunto,
        descripcion,
        prioridad,
        observaciones
      });

      return res.status(201).json({
        message: 'Solicitud registrada exitosamente.',
        solicitud: nuevaSolicitud
      });
    } catch (error) {
      console.error('Error en solicitudController.createSolicitud:', error);
      return res.status(500).json({ error: 'Error interno al registrar la solicitud.' });
    }
  },

  getSolicitudes: async (req, res) => {
    try {
      const { estado, dependencia } = req.query;
      const { id: usuario_id, rol_nombre } = req.user;

      const solicitudes = await SolicitudModel.findAll({
        usuario_id,
        rol_nombre,
        estado,
        dependencia
      });

      return res.json({ solicitudes });
    } catch (error) {
      console.error('Error en solicitudController.getSolicitudes:', error);
      return res.status(500).json({ error: 'Error al obtener la lista de solicitudes.' });
    }
  },

  getSolicitudById: async (req, res) => {
    try {
      const { id } = req.params;
      const solicitud = await SolicitudModel.findById(id);

      if (!solicitud) {
        return res.status(404).json({ error: 'Solicitud no encontrada.' });
      }

      // Si es estudiante o docente, solo puede ver la suya (a menos que sea admin o administrativo)
      if (req.user.rol_nombre === 'Estudiante' && solicitud.usuario_id !== req.user.id) {
        return res.status(403).json({ error: 'No tienes permiso para consultar esta solicitud.' });
      }

      const historial = await SolicitudModel.findHistorialBySolicitudId(id);

      return res.json({
        solicitud,
        historial
      });
    } catch (error) {
      console.error('Error en solicitudController.getSolicitudById:', error);
      return res.status(500).json({ error: 'Error al obtener el detalle de la solicitud.' });
    }
  },

  updateEstado: async (req, res) => {
    try {
      const { id } = req.params;
      const { estado_nuevo, observacion, respuesta_final } = req.body;
      const { id: cambiado_por_id, nombre: cambiado_por_nombre } = req.user;

      const estadosValidos = ['REGISTRADA', 'EN_REVISION', 'ASIGNADA', 'EN_PROCESO', 'RESUELTA', 'CERRADA'];
      if (!estado_nuevo || !estadosValidos.includes(estado_nuevo)) {
        return res.status(400).json({ 
          error: `El estado '${estado_nuevo}' no es válido. Estados permitidos: [${estadosValidos.join(', ')}]` 
        });
      }

      const resultado = await SolicitudModel.updateEstado(id, estado_nuevo, cambiado_por_id, cambiado_por_nombre, observacion, respuesta_final);

      if (resultado.error) {
        return res.status(400).json({ error: resultado.error });
      }

      return res.json({
        message: `Estado de la solicitud actualizado exitosamente a '${estado_nuevo}'.`,
        solicitud: resultado.solicitud
      });
    } catch (error) {
      console.error('Error en solicitudController.updateEstado:', error);
      return res.status(500).json({ error: 'Error al actualizar el estado de la solicitud.' });
    }
  },

  assignResponsable: async (req, res) => {
    try {
      const { id } = req.params;
      const { responsable_id, responsable_nombre } = req.body;
      const { id: cambiado_por_id, nombre: cambiado_por_nombre } = req.user;

      if (!responsable_id || !responsable_nombre) {
        return res.status(400).json({ error: 'responsable_id y responsable_nombre son requeridos.' });
      }

      const actualizada = await SolicitudModel.assignResponsable(id, responsable_id, responsable_nombre, cambiado_por_id, cambiado_por_nombre);

      if (!actualizada) {
        return res.status(404).json({ error: 'Solicitud no encontrada.' });
      }

      return res.json({
        message: `Responsable '${responsable_nombre}' asignado correctamente a la solicitud.`,
        solicitud: actualizada
      });
    } catch (error) {
      console.error('Error en solicitudController.assignResponsable:', error);
      return res.status(500).json({ error: 'Error al asignar el responsable.' });
    }
  },

  updateSolicitud: async (req, res) => {
    try {
      const { id } = req.params;
      const solicitud = await SolicitudModel.findById(id);

      if (!solicitud) {
        return res.status(404).json({ error: 'Solicitud no encontrada.' });
      }

      if (solicitud.estado !== 'REGISTRADA' && req.user.rol_nombre !== 'Administrador') {
        return res.status(400).json({ error: 'Solo se pueden modificar solicitudes en estado REGISTRADA.' });
      }

      const actualizada = await SolicitudModel.update(id, req.body);
      return res.json({ message: 'Solicitud actualizada correctamente.', solicitud: actualizada });
    } catch (error) {
      console.error('Error en solicitudController.updateSolicitud:', error);
      return res.status(500).json({ error: 'Error al actualizar la solicitud.' });
    }
  },

  deleteSolicitud: async (req, res) => {
    try {
      const { id } = req.params;
      const solicitud = await SolicitudModel.findById(id);

      if (!solicitud) {
        return res.status(404).json({ error: 'Solicitud no encontrada.' });
      }

      // Solo el creador (si está REGISTRADA) o un Administrador pueden borrarla
      if (req.user.rol_nombre !== 'Administrador' && (solicitud.usuario_id !== req.user.id || solicitud.estado !== 'REGISTRADA')) {
        return res.status(403).json({ error: 'No tienes permiso para cancelar o eliminar esta solicitud.' });
      }

      await SolicitudModel.delete(id);
      return res.json({ message: 'Solicitud eliminada exitosamente.', id });
    } catch (error) {
      console.error('Error en solicitudController.deleteSolicitud:', error);
      return res.status(500).json({ error: 'Error al eliminar la solicitud.' });
    }
  }
};

module.exports = solicitudController;
