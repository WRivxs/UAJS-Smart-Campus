import React, { useState, useMemo } from 'react';
import useAdminEventos from '../../hooks/useAdminEventos';

const ESTADOS_EVENTO = ['TODOS', 'PROGRAMADO', 'EN_CURSO', 'FINALIZADO', 'CANCELADO'];
const TIPOS_EVENTO = ['TODOS', 'ACADEMICO', 'CULTURAL', 'DEPORTIVO', 'INSTITUCIONAL', 'TALLER'];

export const AdminEventos = () => {
  const {
    eventos,
    loading,
    actionLoading,
    error,
    refetch,
    crearEvento,
    editarEvento,
    cambiarEstadoEvento,
    eliminarEvento,
    emitirDifusion,
  } = useAdminEventos();

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('TODOS');
  const [tipoFiltro, setTipoFiltro] = useState('TODOS');

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDifusionModal, setShowDifusionModal] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState(null);

  // Formularios
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'ACADEMICO',
    lugar: '',
    fecha_inicio: '',
    fecha_fin: '',
    aforo_maximo: 50,
    estado: 'PROGRAMADO',
    organizador: 'Vicerrectoría Académica UAJS',
  });

  const [difusionData, setDifusionData] = useState({
    titulo: '',
    mensaje: '',
    tipo: 'COMUNICADO',
    prioridad: 'MEDIA',
  });

  // Notificación flotante de feedback
  const [feedback, setFeedback] = useState(null);

  const showFeedbackMsg = (type, text) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4500);
  };

  // Filtrado Seguro
  const safeEventos = useMemo(() => (Array.isArray(eventos) ? eventos : []), [eventos]);

  const filteredEventos = useMemo(() => {
    return safeEventos.filter((ev) => {
      if (!ev || typeof ev !== 'object') return false;
      const matchSearch =
        (ev.titulo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ev.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ev.lugar || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ev.organizador || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchEstado =
        estadoFiltro === 'TODOS' || (ev.estado || '').toUpperCase() === estadoFiltro;

      const matchTipo =
        tipoFiltro === 'TODOS' || (ev.tipo || '').toUpperCase() === tipoFiltro;

      return matchSearch && matchEstado && matchTipo;
    });
  }, [safeEventos, searchTerm, estadoFiltro, tipoFiltro]);

  // KPIs
  const stats = useMemo(() => {
    const total = safeEventos.length;
    const programados = safeEventos.filter((e) => (e?.estado || '').toUpperCase() === 'PROGRAMADO').length;
    const enCurso = safeEventos.filter((e) => (e?.estado || '').toUpperCase() === 'EN_CURSO').length;
    const finalizados = safeEventos.filter((e) => (e?.estado || '').toUpperCase() === 'FINALIZADO').length;
    return { total, programados, enCurso, finalizados };
  }, [safeEventos]);

  // Abrir modal Crear
  const handleOpenCreate = () => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    setFormData({
      titulo: '',
      descripcion: '',
      tipo: 'ACADEMICO',
      lugar: 'Auditorio Principal',
      fecha_inicio: now.toISOString().slice(0, 16),
      fecha_fin: tomorrow.toISOString().slice(0, 16),
      aforo_maximo: 50,
      estado: 'PROGRAMADO',
      organizador: 'Vicerrectoría Académica UAJS',
    });
    setShowCreateModal(true);
  };

  // Abrir modal Editar
  const handleOpenEdit = (evento) => {
    setSelectedEvento(evento);
    setFormData({
      titulo: evento.titulo || '',
      descripcion: evento.descripcion || '',
      tipo: evento.tipo || 'ACADEMICO',
      lugar: evento.lugar || '',
      fecha_inicio: evento.fecha_inicio ? evento.fecha_inicio.slice(0, 16) : '',
      fecha_fin: evento.fecha_fin ? evento.fecha_fin.slice(0, 16) : '',
      aforo_maximo: evento.aforo_maximo || 50,
      estado: evento.estado || 'PROGRAMADO',
      organizador: evento.organizador || 'Vicerrectoría Académica UAJS',
    });
    setShowEditModal(true);
  };

  // Abrir modal Eliminar
  const handleOpenDelete = (evento) => {
    setSelectedEvento(evento);
    setShowDeleteModal(true);
  };

  // Abrir modal Difusión Masiva
  const handleOpenDifusion = () => {
    setDifusionData({
      titulo: '',
      mensaje: '',
      tipo: 'COMUNICADO',
      prioridad: 'MEDIA',
    });
    setShowDifusionModal(true);
  };

  // Submit Crear
  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    if (!formData.titulo || !formData.lugar) {
      showFeedbackMsg('error', 'Título y Lugar son obligatorios.');
      return;
    }

    const payload = {
      ...formData,
      aforo_maximo: parseInt(formData.aforo_maximo, 10) || 1,
    };

    const res = await crearEvento(payload);
    if (res.ok) {
      setShowCreateModal(false);
      showFeedbackMsg('success', res.message);
    } else {
      showFeedbackMsg('error', res.message);
    }
  };

  // Submit Editar
  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!selectedEvento) return;

    const payload = {
      ...formData,
      aforo_maximo: parseInt(formData.aforo_maximo, 10) || 1,
    };

    const res = await editarEvento(selectedEvento.id, payload);
    if (res.ok) {
      setShowEditModal(false);
      showFeedbackMsg('success', res.message);
    } else {
      showFeedbackMsg('error', res.message);
    }
  };

  // Submit Eliminar
  const handleConfirmDelete = async () => {
    if (!selectedEvento) return;
    const res = await eliminarEvento(selectedEvento.id);
    if (res.ok) {
      setShowDeleteModal(false);
      showFeedbackMsg('success', res.message);
    } else {
      showFeedbackMsg('error', res.message);
    }
  };

  // Submit Difusión Masiva (POST /api/notificaciones/difusion)
  const handleSubmitDifusion = async (e) => {
    e.preventDefault();
    if (!difusionData.titulo || !difusionData.mensaje) {
      showFeedbackMsg('error', 'Título y mensaje son obligatorios para la alerta.');
      return;
    }

    const res = await emitirDifusion(difusionData);
    if (res.ok) {
      setShowDifusionModal(false);
      showFeedbackMsg('success', res.message);
    } else {
      showFeedbackMsg('error', res.message);
    }
  };

  // Cambiar Estado Rápido
  const handleQuickStatusChange = async (evento, nuevoEstado) => {
    const res = await cambiarEstadoEvento(evento.id, nuevoEstado);
    if (res.ok) {
      showFeedbackMsg('success', res.message);
    } else {
      showFeedbackMsg('error', res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-sm font-medium transition-all ${
            feedback.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}
        >
          <span className="material-symbols-outlined text-xl">
            {feedback.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="ml-2 hover:opacity-75">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#0a47b8]">
              Agenda y Comunicaciones
            </span>
            <span className="text-xs text-slate-400">Plataforma Institucional</span>
          </div>
          <h2 className="text-2xl font-bold text-[#081f56] tracking-tight mt-1">
            Agenda Institucional y Sistema de Alertas
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Publicación de congresos, talleres y emisión de alertas institucionales masivas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenDifusion}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-xs text-xs font-semibold transition"
          >
            <span className="material-symbols-outlined text-base">campaign</span>
            <span>Difusión Masiva</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0a47b8] hover:bg-[#081f56] text-white rounded-xl shadow-xs text-xs font-semibold transition"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span>Nuevo Evento</span>
          </button>
          <button
            onClick={() => refetch()}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-[#0a47b8] hover:bg-blue-50 rounded-xl transition border border-slate-200"
            title="Recargar eventos"
          >
            <span className={`material-symbols-outlined text-xl ${loading ? 'animate-spin' : ''}`}>
              refresh
            </span>
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Total Eventos</p>
            <h4 className="text-2xl font-bold text-[#081f56] mt-0.5">{stats.total}</h4>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0a47b8] flex items-center justify-center">
            <span className="material-symbols-outlined">event</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Programados</p>
            <h4 className="text-2xl font-bold text-blue-600 mt-0.5">{stats.programados}</h4>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <span className="material-symbols-outlined">upcoming</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">En Curso</p>
            <h4 className="text-2xl font-bold text-emerald-600 mt-0.5">{stats.enCurso}</h4>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <span className="material-symbols-outlined">play_circle</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Finalizados</p>
            <h4 className="text-2xl font-bold text-slate-600 mt-0.5">{stats.finalizados}</h4>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <span className="material-symbols-outlined">task_alt</span>
          </div>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar por título, lugar, organizador o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a47b8]/20 focus:border-[#0a47b8]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <span className="text-slate-400 font-medium">Estado:</span>
            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              {ESTADOS_EVENTO.map((est) => (
                <option key={est} value={est}>
                  {est}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <span className="text-slate-400 font-medium">Tipo:</span>
            <select
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              {TIPOS_EVENTO.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Eventos */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-100 shadow-sm text-center">
          <span className="material-symbols-outlined text-4xl text-[#0a47b8] animate-spin">
            progress_activity
          </span>
          <p className="text-sm text-slate-500 mt-3">Consultando agenda de eventos...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center">
          <span className="material-symbols-outlined text-4xl text-rose-500">warning</span>
          <h4 className="text-base font-bold text-rose-900 mt-2">Error al cargar agenda</h4>
          <p className="text-sm text-rose-700 mt-1">{error}</p>
        </div>
      ) : filteredEventos.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-100 shadow-sm text-center">
          <span className="material-symbols-outlined text-4xl text-slate-300">event_busy</span>
          <h4 className="text-base font-semibold text-slate-700 mt-2">No se encontraron eventos</h4>
          <p className="text-sm text-slate-400 mt-1">
            No hay actividades en agenda que coincidan con la búsqueda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredEventos.map((ev) => {
            const estado = (ev.estado || '').toUpperCase();
            const isEnCurso = estado === 'EN_CURSO';
            const isProgramado = estado === 'PROGRAMADO';
            const isFinalizado = estado === 'FINALIZADO';

            return (
              <div
                key={ev.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Header Evento */}
                  <div className="p-5 pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#0a47b8] uppercase tracking-wider">
                        {ev.tipo || 'ACADÉMICO'}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          isEnCurso
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isProgramado
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : isFinalizado
                            ? 'bg-slate-100 text-slate-600 border border-slate-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isEnCurso
                              ? 'bg-emerald-500 animate-ping'
                              : isProgramado
                              ? 'bg-blue-500'
                              : 'bg-slate-400'
                          }`}
                        />
                        {ev.estado || 'PROGRAMADO'}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[#081f56] mt-3 line-clamp-1">
                      {ev.titulo}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {ev.descripcion || 'Sin descripción detallada para esta actividad.'}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="px-5 py-3 bg-slate-50/70 border-y border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        Lugar:
                      </span>
                      <span className="font-semibold text-slate-800 line-clamp-1">
                        {ev.lugar || 'Campus UAJS'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        Fecha:
                      </span>
                      <span className="font-medium text-slate-700">
                        {ev.fecha_inicio ? new Date(ev.fecha_inicio).toLocaleDateString() : 'N/D'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <span className="material-symbols-outlined text-sm">groups</span>
                        Aforo:
                      </span>
                      <span className="font-semibold text-[#081f56]">
                        {ev.aforo_maximo || 0} personas
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer y Acciones */}
                <div className="p-4 bg-white flex items-center justify-between gap-2 border-t border-slate-100">
                  {/* Selector rápido de estado */}
                  <select
                    value={ev.estado || 'PROGRAMADO'}
                    onChange={(e) => handleQuickStatusChange(ev, e.target.value)}
                    disabled={actionLoading}
                    className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
                  >
                    <option value="PROGRAMADO">PROGRAMADO</option>
                    <option value="EN_CURSO">EN CURSO</option>
                    <option value="FINALIZADO">FINALIZADO</option>
                    <option value="CANCELADO">CANCELADO</option>
                  </select>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(ev)}
                      className="p-2 text-slate-500 hover:text-[#0a47b8] hover:bg-blue-50 rounded-lg transition"
                      title="Editar evento"
                    >
                      <span className="material-symbols-outlined text-base">edit</span>
                    </button>
                    <button
                      onClick={() => handleOpenDelete(ev)}
                      className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Eliminar evento"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL CREAR EVENTO */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-100 overflow-hidden my-8">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0a47b8] text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">event_available</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#081f56]">Publicar Nuevo Evento</h3>
                  <p className="text-xs text-slate-400">Agenda Universitaria y Actividades del Campus</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Título del Evento *
                </label>
                <input
                  type="text"
                  required
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ej. Semana Universitaria de Innovación y Tecnología 2026"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a47b8]/20 focus:border-[#0a47b8]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tipo de Actividad
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="ACADEMICO">ACADÉMICO</option>
                    <option value="CULTURAL">CULTURAL</option>
                    <option value="DEPORTIVO">DEPORTIVO</option>
                    <option value="INSTITUCIONAL">INSTITUCIONAL</option>
                    <option value="TALLER">TALLER</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lugar / Espacio *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lugar}
                    onChange={(e) => setFormData({ ...formData, lugar: e.target.value })}
                    placeholder="Ej. Auditorio Mayor o Cancha Múltiple"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fecha y Hora Inicio *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fecha y Hora Fin *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.fecha_fin}
                    onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Aforo Máximo
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.aforo_maximo}
                    onChange={(e) => setFormData({ ...formData, aforo_maximo: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dependencia Organizadora
                  </label>
                  <input
                    type="text"
                    value={formData.organizador}
                    onChange={(e) => setFormData({ ...formData, organizador: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descripción del Evento
                </label>
                <textarea
                  rows="3"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Detalles sobre ponentes, temáticas y requisitos de participación..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-sm font-semibold text-white bg-[#0a47b8] hover:bg-[#081f56] rounded-xl flex items-center gap-2"
                >
                  {actionLoading ? (
                    <span className="material-symbols-outlined text-sm animate-spin">
                      progress_activity
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-sm">publish</span>
                  )}
                  <span>Publicar Evento</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR EVENTO */}
      {showEditModal && selectedEvento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-100 overflow-hidden my-8">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">edit</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#081f56]">Editar Evento #{selectedEvento.id}</h3>
                  <p className="text-xs text-slate-400">Actualizar agenda institucional</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Título del Evento
                </label>
                <input
                  type="text"
                  required
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tipo de Actividad
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="ACADEMICO">ACADÉMICO</option>
                    <option value="CULTURAL">CULTURAL</option>
                    <option value="DEPORTIVO">DEPORTIVO</option>
                    <option value="INSTITUCIONAL">INSTITUCIONAL</option>
                    <option value="TALLER">TALLER</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lugar / Espacio
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lugar}
                    onChange={(e) => setFormData({ ...formData, lugar: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fecha y Hora Inicio
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fecha y Hora Fin
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.fecha_fin}
                    onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descripción
                </label>
                <textarea
                  rows="3"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-sm font-semibold text-white bg-[#0a47b8] hover:bg-[#081f56] rounded-xl flex items-center gap-2"
                >
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DIFUSIÓN MASIVA INSTITUCIONAL */}
      {showDifusionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-amber-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">campaign</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-amber-950">
                    Emitir Alerta Institucional Masiva
                  </h3>
                  <p className="text-xs text-amber-800">
                    Emisión de Alerta Masiva para la Comunidad Universitaria
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDifusionModal(false)}
                className="text-amber-800 hover:opacity-75"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitDifusion} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Título de la Alerta *
                </label>
                <input
                  type="text"
                  required
                  value={difusionData.titulo}
                  onChange={(e) => setDifusionData({ ...difusionData, titulo: e.target.value })}
                  placeholder="Ej. Cierre Temporal de Laboratorios por Mantenimiento Eléctrico"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tipo de Notificación
                  </label>
                  <select
                    value={difusionData.tipo}
                    onChange={(e) => setDifusionData({ ...difusionData, tipo: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="COMUNICADO">COMUNICADO</option>
                    <option value="ALERTA">ALERTA</option>
                    <option value="MANTENIMIENTO">MANTENIMIENTO</option>
                    <option value="URGENTE">URGENTE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Prioridad
                  </label>
                  <select
                    value={difusionData.prioridad}
                    onChange={(e) => setDifusionData({ ...difusionData, prioridad: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="BAJA">BAJA</option>
                    <option value="MEDIA">MEDIA</option>
                    <option value="ALTA">ALTA</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mensaje Institucional *
                </label>
                <textarea
                  required
                  rows="4"
                  value={difusionData.mensaje}
                  onChange={(e) => setDifusionData({ ...difusionData, mensaje: e.target.value })}
                  placeholder="Escribe el comunicado oficial que será notificado a todos los estudiantes y docentes de la plataforma..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <span className="material-symbols-outlined text-base shrink-0">info</span>
                <span>
                  Esta alerta se emitirá en tiempo real a la campana de notificaciones de todos los estudiantes y docentes registrados.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDifusionModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl flex items-center gap-2"
                >
                  {actionLoading ? (
                    <span className="material-symbols-outlined text-sm animate-spin">
                      progress_activity
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-sm">send</span>
                  )}
                  <span>Difundir Alerta</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR EVENTO */}
      {showDeleteModal && selectedEvento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">delete_forever</span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-800">
                ¿Eliminar evento de la agenda?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Se eliminará el evento <strong>{selectedEvento.titulo}</strong> de la agenda institucional.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={actionLoading}
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
              >
                Confirmar Eliminación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEventos;
