import React, { useState, useMemo } from 'react';
import useAdminEventos from '../../hooks/useAdminEventos';
import { useAuth } from '../../hooks/useAuth';

const TIPOS_DOCENTE = ['ACADEMICO', 'TALLER', 'SEMINARIO', 'CONFERENCIA'];
const ESTADOS_EVENTO = ['TODOS', 'PROGRAMADO', 'EN_CURSO', 'FINALIZADO', 'CANCELADO'];

export const MisEventos = () => {
  const {
    eventos,
    loading,
    actionLoading,
    refetch,
    crearEvento,
    editarEvento,
    cambiarEstadoEvento,
    eliminarEvento,
  } = useAdminEventos();

  const { user } = useAuth();
  const userId = user?.id || user?.user_id;
  const docenteNombre = user?.nombre || 'Ana María Gómez Herrera';

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('TODOS');
  const [tipoFiltro, setTipoFiltro] = useState('TODOS');

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState(null);

  // Formulario
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'ACADEMICO',
    lugar: '',
    fecha_inicio: '',
    fecha_fin: '',
    aforo_maximo: 40,
    organizador: docenteNombre,
  });

  // Feedback Toast
  const [feedback, setFeedback] = useState(null);

  const showToast = (type, text) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Filtrar eventos pertenecientes al docente
  const misEventosList = useMemo(() => {
    const list = Array.isArray(eventos) ? eventos : [];
    return list.filter((ev) => {
      if (!ev) return false;
      // Coincidencia por id de organizador o nombre
      const matchOwner =
        (userId && String(ev.organizador_id) === String(userId)) ||
        (ev.organizador && ev.organizador.toLowerCase().includes(docenteNombre.toLowerCase())) ||
        // Si no tiene organizador_id explícito pero fue creado en sesión
        (ev.creado_por && String(ev.creado_por) === String(userId));
      return matchOwner;
    });
  }, [eventos, userId, docenteNombre]);

  // Si aún no hay eventos filtrados por ID exacto, permitimos ver todos los que correspondan o todos si es el único docente activo
  const eventosAMostrar = misEventosList.length > 0 ? misEventosList : (Array.isArray(eventos) ? eventos.filter(e => TIPOS_DOCENTE.includes(e?.tipo)) : []);

  const filteredEventos = useMemo(() => {
    return eventosAMostrar.filter((ev) => {
      const matchSearch =
        (ev.titulo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ev.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ev.lugar || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchEstado =
        estadoFiltro === 'TODOS' || (ev.estado || '').toUpperCase() === estadoFiltro;

      const matchTipo =
        tipoFiltro === 'TODOS' || (ev.tipo || '').toUpperCase() === tipoFiltro;

      return matchSearch && matchEstado && matchTipo;
    });
  }, [eventosAMostrar, searchTerm, estadoFiltro, tipoFiltro]);

  const handleOpenCreate = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      tipo: 'ACADEMICO',
      lugar: '',
      fecha_inicio: '',
      fecha_fin: '',
      aforo_maximo: 40,
      organizador: docenteNombre,
    });
    setShowCreateModal(true);
  };

  const handleOpenEdit = (evento) => {
    setSelectedEvento(evento);
    setFormData({
      titulo: evento.titulo || '',
      descripcion: evento.descripcion || '',
      tipo: evento.tipo || 'ACADEMICO',
      lugar: evento.lugar || '',
      fecha_inicio: evento.fecha_inicio ? evento.fecha_inicio.slice(0, 16) : '',
      fecha_fin: evento.fecha_fin ? evento.fecha_fin.slice(0, 16) : '',
      aforo_maximo: evento.aforo_maximo || 40,
      organizador: evento.organizador || docenteNombre,
    });
    setShowEditModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.titulo.trim() || !formData.lugar.trim() || !formData.fecha_inicio) {
      showToast('error', 'Por favor complete título, lugar y fecha de inicio.');
      return;
    }

    const payload = {
      ...formData,
      aforo_maximo: Number(formData.aforo_maximo) || 40,
      organizador_id: userId,
      estado: 'PROGRAMADO',
    };

    const res = await crearEvento(payload);
    if (res.ok) {
      showToast('success', 'Evento académico publicado exitosamente.');
      setShowCreateModal(false);
      refetch();
    } else {
      showToast('error', res.message || 'Error al publicar el evento.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEvento?.id) return;

    const payload = {
      ...formData,
      aforo_maximo: Number(formData.aforo_maximo) || 40,
    };

    const res = await editarEvento(selectedEvento.id, payload);
    if (res.ok) {
      showToast('success', 'Evento actualizado correctamente.');
      setShowEditModal(false);
      setSelectedEvento(null);
      refetch();
    } else {
      showToast('error', res.message || 'Error al actualizar el evento.');
    }
  };

  const handleCambiarEstado = async (eventoId, nuevoEstado) => {
    const res = await cambiarEstadoEvento(eventoId, nuevoEstado);
    if (res.ok) {
      showToast('success', `Estado actualizado a ${nuevoEstado}.`);
      refetch();
    } else {
      showToast('error', res.message || 'Error al cambiar el estado.');
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedEvento?.id) return;
    const res = await eliminarEvento(selectedEvento.id);
    if (res.ok) {
      showToast('success', 'Evento eliminado del calendario.');
      setShowDeleteModal(false);
      setSelectedEvento(null);
      refetch();
    } else {
      showToast('error', res.message || 'Error al eliminar el evento.');
    }
  };

  const estadoBadgeClass = (estado = '') => {
    switch (estado.toUpperCase()) {
      case 'PROGRAMADO':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'EN_CURSO':
        return 'bg-violet-50 text-violet-700 border-violet-200 animate-pulse';
      case 'FINALIZADO':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'CANCELADO':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full text-slate-800">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-sm font-medium transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-600 text-white'
          }`}
        >
          <span className="material-symbols-outlined text-xl">
            {feedback.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Encabezado y Acción Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-violet-600 text-2xl">event_available</span>
            <h1 className="text-xl sm:text-2xl font-bold font-space text-slate-900">
              Mis Eventos Académicos
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Crea, administra y difunde actividades académicas, seminarios, conferencias y talleres formativos.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs sm:text-sm font-bold font-space shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          <span>Nuevo Evento Académico</span>
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar por título, lugar o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Estado:</span>
            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            >
              {ESTADOS_EVENTO.map((est) => (
                <option key={est} value={est}>
                  {est}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Tipo:</span>
            <select
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            >
              <option value="TODOS">TODOS</option>
              {TIPOS_DOCENTE.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
            title="Recargar eventos"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Grid de Eventos */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/90">
          <span className="material-symbols-outlined text-violet-600 text-4xl animate-spin mb-3">
            progress_activity
          </span>
          <p className="text-sm font-semibold text-slate-600">Cargando tus eventos académicos...</p>
        </div>
      ) : filteredEventos.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/90 space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">event_busy</span>
          </div>
          <h3 className="text-base font-bold text-slate-800 font-space">No se encontraron eventos</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchTerm || estadoFiltro !== 'TODOS' || tipoFiltro !== 'TODOS'
              ? 'No hay eventos que coincidan con los filtros seleccionados.'
              : 'Aún no has creado eventos académicos. Haz clic en "Nuevo Evento Académico" para programar el primero.'}
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="mt-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-bold font-space hover:bg-violet-700 transition"
          >
            Crear mi primer evento
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEventos.map((ev) => {
            const fechaStr = ev.fecha_inicio
              ? new Date(ev.fecha_inicio).toLocaleDateString('es-CO', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Fecha por definir';

            return (
              <div
                key={ev.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Cabecera de la Tarjeta */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider bg-violet-100 text-violet-800 border border-violet-200">
                      {ev.tipo || 'ACADEMICO'}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-space border ${estadoBadgeClass(
                        ev.estado
                      )}`}
                    >
                      {ev.estado || 'PROGRAMADO'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-space line-clamp-1 group-hover:text-violet-700 transition">
                      {ev.titulo}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {ev.descripcion || 'Sin descripción detallada.'}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2 text-xs text-slate-600 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-slate-400">schedule</span>
                      <span className="truncate">{fechaStr}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-slate-400">location_on</span>
                      <span className="truncate">{ev.lugar || 'Campus UAJS'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-slate-400">group</span>
                      <span>Aforo: {ev.aforo_maximo || 'Sin límite'} participantes</span>
                    </div>
                  </div>
                </div>

                {/* Pie de Acciones */}
                <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                  {/* Selector rápido de estado */}
                  <select
                    value={ev.estado || 'PROGRAMADO'}
                    disabled={actionLoading}
                    onChange={(e) => handleCambiarEstado(ev.id, e.target.value)}
                    className="text-[11px] font-semibold bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
                  >
                    <option value="PROGRAMADO">PROGRAMADO</option>
                    <option value="EN_CURSO">EN_CURSO</option>
                    <option value="FINALIZADO">FINALIZADO</option>
                    <option value="CANCELADO">CANCELADO</option>
                  </select>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(ev)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-violet-700 hover:bg-violet-50 transition"
                      title="Editar evento"
                    >
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEvento(ev);
                        setShowDeleteModal(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Eliminar evento"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal: Crear Evento Académico ─────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Cabecera institucional */}
            <div className="bg-gradient-to-r from-[#081f56] via-[#0a47b8] to-violet-700 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl text-violet-300">event_available</span>
                <h3 className="font-bold text-base font-space">Publicar Evento Académico</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-white/80 hover:text-white transition"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Título del Evento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Taller Avanzado de Algoritmos Distribuidos"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tipo de Evento</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 font-semibold"
                  >
                    {TIPOS_DOCENTE.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Aforo Máximo (Cupos)</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={formData.aforo_maximo}
                    onChange={(e) => setFormData({ ...formData, aforo_maximo: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Lugar / Espacio Físico *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Aula 302 - Edificio de Ingenierías"
                  value={formData.lugar}
                  onChange={(e) => setFormData({ ...formData, lugar: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Fecha y Hora Inicio *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Fecha y Hora Fin</label>
                  <input
                    type="datetime-local"
                    value={formData.fecha_fin}
                    onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Descripción / Objetivos</label>
                <textarea
                  rows="3"
                  placeholder="Objetivos del evento, público objetivo y requisitos para los asistentes..."
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Organizador Responsable</label>
                <input
                  type="text"
                  value={formData.organizador}
                  onChange={(e) => setFormData({ ...formData, organizador: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold font-space shadow-md transition flex items-center gap-1.5"
                >
                  {actionLoading && (
                    <span className="material-symbols-outlined text-sm animate-spin">
                      progress_activity
                    </span>
                  )}
                  <span>Publicar Evento</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Editar Evento ───────────────────────────────────────── */}
      {showEditModal && selectedEvento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-[#081f56] via-[#0a47b8] to-violet-700 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl text-violet-300">edit_calendar</span>
                <h3 className="font-bold text-base font-space">Editar Evento Académico</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-white/80 hover:text-white transition"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Título del Evento *</label>
                <input
                  type="text"
                  required
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tipo de Evento</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 font-semibold"
                  >
                    {TIPOS_DOCENTE.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Aforo Máximo</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={formData.aforo_maximo}
                    onChange={(e) => setFormData({ ...formData, aforo_maximo: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Lugar / Espacio Físico *</label>
                <input
                  type="text"
                  required
                  value={formData.lugar}
                  onChange={(e) => setFormData({ ...formData, lugar: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Fecha y Hora Inicio *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Fecha y Hora Fin</label>
                  <input
                    type="datetime-local"
                    value={formData.fecha_fin}
                    onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Descripción</label>
                <textarea
                  rows="3"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold font-space shadow-md transition flex items-center gap-1.5"
                >
                  {actionLoading && (
                    <span className="material-symbols-outlined text-sm animate-spin">
                      progress_activity
                    </span>
                  )}
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Eliminar Evento ─────────────────────────────────────── */}
      {showDeleteModal && selectedEvento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">warning</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-space">
                ¿Eliminar este evento académico?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Se cancelará y removerá el evento{' '}
                <strong className="text-slate-700">"{selectedEvento.titulo}"</strong> de la agenda del
                campus.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleDeleteSubmit}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold font-space shadow-md transition flex items-center gap-1"
              >
                {actionLoading && (
                  <span className="material-symbols-outlined text-sm animate-spin">
                    progress_activity
                  </span>
                )}
                <span>Confirmar Eliminación</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MisEventos;

