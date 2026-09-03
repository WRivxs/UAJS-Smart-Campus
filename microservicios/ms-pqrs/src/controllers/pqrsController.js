const PqrsModel = require('../models/pqrsModel');

const pqrsController = {
  createPqrs: async (req, res) => {
    try {
      const { tipo, asunto, descripcion, dependencia_destino, anonimo } = req.body;
      const { id: usuario_id, nombre: usuario_nombre, email: usuario_email } = req.user;

      const tiposValidos = ['PETICION', 'QUEJA', 'RECLAMO', 'SUGERENCIA'];
      if (tipo && !tiposValidos.includes(tipo)) {
        return res.status(400).json({ error: `El tipo '${tipo}' no es válido. Tipos permitidos: [${tiposValidos.join(', ')}]` });
      }

      if (!asunto || !descripcion || !dependencia_destino) {
        return res.status(400).json({ error: 'asunto, descripcion y dependencia_destino son obligatorios.' });
      }

      const nuevaPqrs = await PqrsModel.create({
        usuario_id,
        usuario_nombre,
        usuario_email,
        tipo,
        asunto,
        descripcion,
        dependencia_destino,
        anonimo
      });

      return res.status(201).json({
        message: 'Ticket de PQRS registrado exitosamente.',
        pqrs: nuevaPqrs
      });
    } catch (error) {
      console.error('Error en pqrsController.createPqrs:', error);
      return res.status(500).json({ error: 'Error interno al registrar el ticket de PQRS.' });
    }
  },

  getPqrs: async (req, res) => {
    try {
      const { estado, dependencia, tipo } = req.query;
      const { id: usuario_id, rol_nombre } = req.user;

      const listaPqrs = await PqrsModel.findAll({
        usuario_id,
        rol_nombre,
        estado,
        dependencia,
        tipo
      });

      return res.json({ pqrs: listaPqrs });
    } catch (error) {
      console.error('Error en pqrsController.getPqrs:', error);
      return res.status(500).json({ error: 'Error al obtener los tickets de PQRS.' });
    }
  },

  getPqrsById: async (req, res) => {
    try {
      const { id } = req.params;
      const ticket = await PqrsModel.findById(id);

      if (!ticket) {
        return res.status(404).json({ error: 'Ticket de PQRS no encontrado.' });
      }

      // Si es estudiante, solo puede consultar el suyo
      if (req.user.rol_nombre === 'Estudiante' && ticket.usuario_id !== req.user.id) {
        return res.status(403).json({ error: 'No tienes permiso para consultar este ticket de PQRS.' });
      }

      const respuestas = await PqrsModel.findRespuestasByPqrsId(id);

      return res.json({
        pqrs: ticket,
        respuestas
      });
    } catch (error) {
      console.error('Error en pqrsController.getPqrsById:', error);
      return res.status(500).json({ error: 'Error al obtener el detalle del PQRS.' });
    }
  },

  responderPqrs: async (req, res) => {
    try {
      const { id } = req.params;
      const { mensaje } = req.body;
      const { id: respondido_por_id, nombre: respondido_por_nombre } = req.user;

      if (!mensaje) {
        return res.status(400).json({ error: 'El mensaje de respuesta es obligatorio.' });
      }

      const respondida = await PqrsModel.responderPqrs(id, respondido_por_id, respondido_por_nombre, mensaje);

      if (!respondida) {
        return res.status(404).json({ error: 'Ticket de PQRS no encontrado.' });
      }

      return res.json({
        message: 'Respuesta registrada exitosamente. Estado del PQRS cambiado a RESPONDIDA.',
        pqrs: respondida
      });
    } catch (error) {
      console.error('Error en pqrsController.responderPqrs:', error);
      return res.status(500).json({ error: 'Error al registrar la respuesta del PQRS.' });
    }
  },

  updateEstado: async (req, res) => {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      const estadosValidos = ['RECIBIDA', 'EN_TRAMITE', 'RESPONDIDA', 'CERRADA'];
      if (!estado || !estadosValidos.includes(estado)) {
        return res.status(400).json({ error: `El estado '${estado}' no es válido.` });
      }

      const actualizada = await PqrsModel.updateEstado(id, estado);
      if (!actualizada) {
        return res.status(404).json({ error: 'Ticket de PQRS no encontrado.' });
      }

      return res.json({ message: `Estado del PQRS cambiado a '${estado}'.`, pqrs: actualizada });
    } catch (error) {
      console.error('Error en pqrsController.updateEstado:', error);
      return res.status(500).json({ error: 'Error al actualizar el estado del PQRS.' });
    }
  },

  deletePqrs: async (req, res) => {
    try {
      const { id } = req.params;
      const ticket = await PqrsModel.findById(id);

      if (!ticket) {
        return res.status(404).json({ error: 'Ticket de PQRS no encontrado.' });
      }

      if (req.user.rol_nombre !== 'Administrador' && (ticket.usuario_id !== req.user.id || ticket.estado !== 'RECIBIDA')) {
        return res.status(403).json({ error: 'No tienes permiso para eliminar este ticket de PQRS.' });
      }

      await PqrsModel.delete(id);
      return res.json({ message: 'Ticket de PQRS eliminado exitosamente.', id });
    } catch (error) {
      console.error('Error en pqrsController.deletePqrs:', error);
      return res.status(500).json({ error: 'Error al eliminar el ticket de PQRS.' });
    }
  }
};

module.exports = pqrsController;
