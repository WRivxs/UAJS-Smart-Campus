import React, { useState, useMemo } from 'react';
import useAdminRecursos from '../../hooks/useAdminRecursos';

const TIPOS_RECURSO = ['TODOS', 'ESPACIO', 'EQUIPO', 'LABORATORIO', 'AUDITORIO', 'SALA', 'RECURSO_TECNOLOGICO', 'ESPACIO_ACADEMICO'];
const ESTADOS_DISP = ['TODOS', 'DISPONIBLE', 'NO_DISPONIBLE', 'EN_MANTENIMIENTO'];

// Helper seguro para evaluar disponibilidad (soporta booleano de PostgreSQL o string)
const isDisponibilidadActiva = (val) => {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') {
    const s = val.trim().toUpperCase();
    return s === 'DISPONIBLE' || s === 'TRUE' || s === 'ACTIVO' || s === 'BUENO';
  }
  if (typeof val === 'number') return val === 1;
  return Boolean(val);
};

// Helper seguro para obtener el texto de estado/disponibilidad
const getDisponibilidadTexto = (rec) => {
  if (!rec) return 'DISPONIBLE';
  const est = String(rec.estado || '').toUpperCase();
  if (est === 'EN_MANTENIMIENTO') return 'EN_MANTENIMIENTO';
  if (est === 'DANADO' || est === 'Dañado') return 'NO_DISPONIBLE';
  return isDisponibilidadActiva(rec.disponibilidad) ? 'DISPONIBLE' : 'NO_DISPONIBLE';
};

export const AdminRecursos = () => {
  const {
    recursos,
    loading,
    actionLoading,
    error,
    refetch,
    crearRecurso,
    editarRecurso,
    cambiarEstadoRecurso,
    eliminarRecurso,
    registrarMantenimiento,
  } = useAdminRecursos();

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('TODOS');
  const [dispFiltro, setDispFiltro] = useState('TODOS');

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMantenimientoModal, setShowMantenimientoModal] = useState(false);
  const [selectedRecurso, setSelectedRecurso] = useState(null);

  // Formularios
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    tipo: 'LABORATORIO',
    ubicacion: '',
    aforo_maximo: 30,
    estado: 'BUENO',
    disponibilidad: 'DISPONIBLE',
    descripcion: '',
    imagen_url: '',
  });

  const [mantenimientoData, setMantenimientoData] = useState({
    descripcion: '',
    tipo: 'PREVENTIVO',
    fecha_inicio: new Date().toISOString().slice(0, 10),
    fecha_fin: '',
    tecnico_responsable: 'Servicios Generales y TI UAJS',
    costo_estimado: 0,
  });

  // Notificación flotante de feedback
  const [feedback, setFeedback] = useState(null);

  const showFeedbackMsg = (type, text) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4500);
  };

  // Asegurar siempre un arreglo seguro de datos
  const safeRecursos = useMemo(() => {
    return Array.isArray(recursos) ? recursos : [];
  }, [recursos]);

  // Filtrado Seguro
  const filteredRecursos = useMemo(() => {
    return safeRecursos.filter((r) => {
      if (!r || typeof r !== 'object') return false;

      const nombre = String(r.nombre || '').toLowerCase();
      const codigo = String(r.codigo || '').toLowerCase();
      const ubicacion = String(r.ubicacion || '').toLowerCase();
      const q = String(searchTerm || '').toLowerCase().trim();

      const matchSearch = !q || nombre.includes(q) || codigo.includes(q) || ubicacion.includes(q);

      const rTipo = String(r.tipo || '').toUpperCase();
      const matchTipo = tipoFiltro === 'TODOS' || rTipo === tipoFiltro;

      const rDispTexto = getDisponibilidadTexto(r);
      const matchDisp = dispFiltro === 'TODOS' || rDispTexto === dispFiltro;

      return matchSearch && matchTipo && matchDisp;
    });
  }, [safeRecursos, searchTerm, tipoFiltro, dispFiltro]);

  // KPIs
  const stats = useMemo(() => {
    const total = safeRecursos.length;
    const disponibles = safeRecursos.filter(
      (r) => getDisponibilidadTexto(r) === 'DISPONIBLE'
    ).length;
    const mantenimiento = safeRecursos.filter(
      (r) => getDisponibilidadTexto(r) === 'EN_MANTENIMIENTO'
    ).length;
    const ocupados = safeRecursos.filter(
      (r) => getDisponibilidadTexto(r) === 'NO_DISPONIBLE'
    ).length;
    return { total, disponibles, mantenimiento, ocupados };
  }, [safeRecursos]);

  // Handlers Modales
  const handleOpenCreate = () => {
    setFormData({
      codigo: `REC-${Math.floor(100 + Math.random() * 900)}`,
      nombre: '',
      tipo: 'LABORATORIO',
      ubicacion: '',
      aforo_maximo: 30,
      estado: 'BUENO',
      disponibilidad: 'DISPONIBLE',
      descripcion: '',
      imagen_url: '',
    });
    setShowCreateModal(true);
  };

  const handleOpenEdit = (recurso) => {
    if (!recurso) return;
    setSelectedRecurso(recurso);
    setFormData({
      codigo: recurso.codigo || '',
      nombre: recurso.nombre || '',
      tipo: recurso.tipo || 'LABORATORIO',
      ubicacion: recurso.ubicacion || '',
      aforo_maximo: recurso.aforo_maximo || 30,
      estado: recurso.estado || 'BUENO',
      disponibilidad: isDisponibilidadActiva(recurso.disponibilidad) ? 'DISPONIBLE' : 'NO_DISPONIBLE',
      descripcion: recurso.descripcion || '',
      imagen_url: recurso.imagen_url || '',
    });
    setShowEditModal(true);
  };

  const handleOpenDelete = (recurso) => {
    if (!recurso) return;
    setSelectedRecurso(recurso);
    setShowDeleteModal(true);
  };

  const handleOpenMantenimiento = (recurso) => {
    if (!recurso) return;
    setSelectedRecurso(recurso);
    setMantenimientoData({
      descripcion: `Mantenimiento preventivo para ${recurso.nombre || recurso.codigo}`,
      tipo: 'PREVENTIVO',
      fecha_inicio: new Date().toISOString().slice(0, 10),
      fecha_fin: '',
      tecnico_responsable: 'Servicios Generales y TI UAJS',
      costo_estimado: 0,
    });
    setShowMantenimientoModal(true);
  };

  // Submit Crear
  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    if (!formData.codigo || !formData.nombre || !formData.ubicacion) {
      showFeedbackMsg('error', 'Código, Nombre y Ubicación son campos obligatorios.');
      return;
    }

    const payload = {
      ...formData,
      aforo_maximo: parseInt(formData.aforo_maximo, 10) || 1,
    };

    const res = await crearRecurso(payload);
    if (res.ok) {
      setShowCreateModal(false);
      showFeedbackMsg('success', res.message || 'Recurso registrado exitosamente.');
    } else {
      showFeedbackMsg('error', res.message || 'Error al registrar el recurso.');
    }
  };

  // Submit Editar
  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!selectedRecurso) return;

    const payload = {
      ...formData,
      aforo_maximo: parseInt(formData.aforo_maximo, 10) || 1,
    };

    const res = await editarRecurso(selectedRecurso.id, payload);
    if (res.ok) {
      setShowEditModal(false);
      showFeedbackMsg('success', res.message || 'Recurso actualizado exitosamente.');
    } else {
      showFeedbackMsg('error', res.message || 'Error al actualizar el recurso.');
    }
  };

  // Submit Eliminar
  const handleConfirmDelete = async () => {
    if (!selectedRecurso) return;
    const res = await eliminarRecurso(selectedRecurso.id);
    if (res.ok) {
      setShowDeleteModal(false);
      showFeedbackMsg('success', res.message || 'Recurso eliminado del catálogo.');
    } else {
      showFeedbackMsg('error', res.message || 'Error al eliminar el recurso.');
    }
  };

  // Submit Mantenimiento
  const handleSubmitMantenimiento = async (e) => {
    e.preventDefault();
    if (!selectedRecurso) return;
    const res = await registrarMantenimiento(selectedRecurso.id, mantenimientoData);
    if (res.ok) {
      setShowMantenimientoModal(false);
      showFeedbackMsg('success', res.message || 'Mantenimiento registrado.');
    } else {
      showFeedbackMsg('error', res.message || 'Error al registrar orden.');
    }
  };

  // Quick Toggle Disponibilidad
  const handleQuickToggleDisp = async (recurso) => {
    if (!recurso) return;
    const currentlyActive = isDisponibilidadActiva(recurso.disponibilidad);
    const nextDisp = !currentlyActive;
    const nextEstado = nextDisp ? 'BUENO' : 'DANADO';

    const res = await cambiarEstadoRecurso(recurso.id, nextEstado, nextDisp);
    if (res.ok) {
      showFeedbackMsg('success', `Disponibilidad de ${recurso.codigo || 'recurso'} actualizada.`);
    } else {
      showFeedbackMsg('error', res.message || 'Error al cambiar estado.');
    }
  };

  return (
    <div className="space-y-6">
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
          <button
            onClick={() => setFeedback(null)}
            className="ml-2 hover:opacity-75 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#0a47b8]">
              Recursos y Espacios
            </span>
            <span className="text-xs text-slate-400">Catálogo Institucional</span>
          </div>
          <h2 className="text-2xl font-bold text-[#081f56] tracking-tight mt-1 font-space">
            Gestión de Recursos Físicos y Espacios
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Administración completa de auditorios, laboratorios, aulas y equipos tecnológicos del campus.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={loading}
            className="p-2.5 text-slate-600 hover:text-[#0a47b8] hover:bg-blue-50 rounded-xl transition border border-slate-200 cursor-pointer"
            title="Recargar catálogo"
          >
            <span className={`material-symbols-outlined text-xl ${loading ? 'animate-spin' : ''}`}>
              refresh
            </span>
          </button>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0a47b8] hover:bg-[#081f56] text-white rounded-xl shadow-sm text-sm font-semibold transition cursor-pointer font-space"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            <span>Nuevo Recurso</span>
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Total Espacios & Equipos</p>
            <h4 className="text-2xl font-bold text-[#081f56] mt-0.5 font-space">{stats.total}</h4>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0a47b8] flex items-center justify-center">
            <span className="material-symbols-outlined">meeting_room</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Disponibles</p>
            <h4 className="text-2xl font-bold text-emerald-600 mt-0.5 font-space">{stats.disponibles}</h4>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <span className="material-symbols-outlined">check_circle</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">En Mantenimiento</p>
            <h4 className="text-2xl font-bold text-amber-600 mt-0.5 font-space">{stats.mantenimiento}</h4>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <span className="material-symbols-outlined">build</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">No Disponibles</p>
            <h4 className="text-2xl font-bold text-rose-600 mt-0.5 font-space">{stats.ocupados}</h4>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <span className="material-symbols-outlined">block</span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar por código, nombre o ubicación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a47b8]/20 focus:border-[#0a47b8] transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <span className="text-slate-400 font-medium">Tipo:</span>
            <select
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              {TIPOS_RECURSO.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <span className="text-slate-400 font-medium">Disponibilidad:</span>
            <select
              value={dispFiltro}
              onChange={(e) => setDispFiltro(e.target.value)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              {ESTADOS_DISP.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid de Recursos */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-100 shadow-sm text-center">
          <span className="material-symbols-outlined text-4xl text-[#0a47b8] animate-spin">
            progress_activity
          </span>
          <p className="text-sm text-slate-500 mt-3">Consultando catálogo de recursos...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center">
          <span className="material-symbols-outlined text-4xl text-rose-500">warning</span>
          <h4 className="text-base font-bold text-rose-900 mt-2">Error al cargar recursos</h4>
          <p className="text-sm text-rose-700 mt-1">{error}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      ) : filteredRecursos.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-100 shadow-sm text-center">
          <span className="material-symbols-outlined text-4xl text-slate-300">inventory_2</span>
          <h4 className="text-base font-semibold text-slate-700 mt-2">No se encontraron recursos</h4>
          <p className="text-sm text-slate-400 mt-1">Prueba con otros criterios de búsqueda o registra un nuevo espacio.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredRecursos.map((rec) => {
            const dispTexto = getDisponibilidadTexto(rec);
            const isDisp = dispTexto === 'DISPONIBLE';
            const isMantenimiento = dispTexto === 'EN_MANTENIMIENTO';

            return (
              <div
                key={rec.id || rec.codigo}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Header de la tarjeta */}
                  <div className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-slate-100 text-[#081f56]">
                          {rec.codigo || 'S/C'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-[#0a47b8]">
                          {rec.tipo || 'ESPACIO'}
                        </span>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          isDisp
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isMantenimiento
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isDisp ? 'bg-emerald-500' : isMantenimiento ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                        />
                        {isDisp ? 'DISPONIBLE' : isMantenimiento ? 'MANTENIMIENTO' : 'NO DISPONIBLE'}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[#081f56] mt-3 line-clamp-1 font-space">
                      {rec.nombre || 'Recurso sin nombre'}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {rec.descripcion || 'Sin descripción adicional para este recurso.'}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="px-5 py-3 bg-slate-50/70 border-y border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        Ubicación:
                      </span>
                      <span className="font-medium text-slate-700 line-clamp-1">{rec.ubicacion || 'Por asignar'}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <span className="material-symbols-outlined text-sm">groups</span>
                        Aforo Máximo:
                      </span>
                      <span className="font-semibold text-[#081f56]">
                        {rec.aforo_maximo || 0} personas
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <span className="material-symbols-outlined text-sm">toggle_on</span>
                        Estado Físico:
                      </span>
                      <span
                        className={`font-semibold ${
                          rec.estado === 'BUENO' ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {rec.estado || 'BUENO'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="p-4 bg-white flex items-center justify-between gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleQuickToggleDisp(rec)}
                    disabled={actionLoading}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer ${
                      isDisp
                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                    title="Alternar disponibilidad rápida"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {isDisp ? 'block' : 'check'}
                    </span>
                    <span>{isDisp ? 'Inhabilitar' : 'Habilitar'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenMantenimiento(rec)}
                      className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                      title="Registrar orden de mantenimiento"
                    >
                      <span className="material-symbols-outlined text-base">build</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(rec)}
                      className="p-2 text-slate-500 hover:text-[#0a47b8] hover:bg-blue-50 rounded-lg transition cursor-pointer"
                      title="Editar recurso"
                    >
                      <span className="material-symbols-outlined text-base">edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenDelete(rec)}
                      className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="Eliminar recurso"
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

      {/* MODAL CREAR RECURSO */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-100 overflow-hidden my-8">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0a47b8] text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">add_location_alt</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#081f56] font-space">Registrar Nuevo Recurso</h3>
                  <p className="text-xs text-slate-400">Crear un espacio o equipo en el catálogo institucional</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Código Único *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a47b8]/20 focus:border-[#0a47b8]"
                    placeholder="Ej. LAB-204"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tipo de Recurso *
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a47b8]/20 focus:border-[#0a47b8]"
                  >
                    <option value="LABORATORIO">LABORATORIO</option>
                    <option value="AUDITORIO">AUDITORIO</option>
                    <option value="ESPACIO_ACADEMICO">ESPACIO ACADÉMICO</option>
                    <option value="EQUIPO">EQUIPO</option>
                    <option value="RECURSO_TECNOLOGICO">RECURSO TECNOLÓGICO</option>
                    <option value="SALA">SALA</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre Oficial del Recurso *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a47b8]/20 focus:border-[#0a47b8]"
                  placeholder="Ej. Laboratorio de Redes y Telecomunicaciones"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ubicación en el Campus *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ubicacion}
                    onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a47b8]/20 focus:border-[#0a47b8]"
                    placeholder="Ej. Bloque C - Piso 2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Aforo Máximo (Personas)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={formData.aforo_maximo}
                    onChange={(e) => setFormData({ ...formData, aforo_maximo: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a47b8]/20 focus:border-[#0a47b8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Disponibilidad Inicial
                  </label>
                  <select
                    value={formData.disponibilidad}
                    onChange={(e) => setFormData({ ...formData, disponibilidad: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="DISPONIBLE">DISPONIBLE</option>
                    <option value="NO_DISPONIBLE">NO DISPONIBLE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estado Físico
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="BUENO">BUENO / OPERATIVO</option>
                    <option value="EN_MANTENIMIENTO">EN MANTENIMIENTO</option>
                    <option value="DANADO">DAÑADO</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descripción y Equipamiento
                </label>
                <textarea
                  rows="3"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a47b8]/20"
                  placeholder="Incluye videobeam, aire acondicionado, tomas eléctricas..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-sm font-semibold text-white bg-[#0a47b8] hover:bg-[#081f56] rounded-xl flex items-center gap-2 cursor-pointer font-space"
                >
                  {actionLoading ? (
                    <span className="material-symbols-outlined text-sm animate-spin">
                      progress_activity
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-sm">save</span>
                  )}
                  <span>Guardar Recurso</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR RECURSO */}
      {showEditModal && selectedRecurso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-100 overflow-hidden my-8">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">edit</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#081f56] font-space">
                    Editar Recurso: {selectedRecurso.codigo}
                  </h3>
                  <p className="text-xs text-slate-400">Actualizar datos en el catálogo institucional</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Código Único
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tipo de Recurso
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="LABORATORIO">LABORATORIO</option>
                    <option value="AUDITORIO">AUDITORIO</option>
                    <option value="ESPACIO_ACADEMICO">ESPACIO ACADÉMICO</option>
                    <option value="EQUIPO">EQUIPO</option>
                    <option value="RECURSO_TECNOLOGICO">RECURSO TECNOLÓGICO</option>
                    <option value="SALA">SALA</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre Oficial
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ubicacion}
                    onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Disponibilidad
                  </label>
                  <select
                    value={formData.disponibilidad}
                    onChange={(e) => setFormData({ ...formData, disponibilidad: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="DISPONIBLE">DISPONIBLE</option>
                    <option value="NO_DISPONIBLE">NO DISPONIBLE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estado Físico
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="BUENO">BUENO / OPERATIVO</option>
                    <option value="EN_MANTENIMIENTO">EN MANTENIMIENTO</option>
                    <option value="DANADO">DAÑADO</option>
                  </select>
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
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-sm font-semibold text-white bg-[#0a47b8] hover:bg-[#081f56] rounded-xl flex items-center gap-2 cursor-pointer font-space"
                >
                  {actionLoading ? (
                    <span className="material-symbols-outlined text-sm animate-spin">
                      progress_activity
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-sm">save</span>
                  )}
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MANTENIMIENTO */}
      {showMantenimientoModal && selectedRecurso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-amber-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">build</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-amber-950 font-space">
                    Registrar Mantenimiento
                  </h3>
                  <p className="text-xs text-amber-800">
                    {selectedRecurso.codigo} - {selectedRecurso.nombre}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMantenimientoModal(false)}
                className="text-amber-800 hover:opacity-75 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitMantenimiento} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descripción de la Intervención *
                </label>
                <textarea
                  required
                  rows="3"
                  value={mantenimientoData.descripcion}
                  onChange={(e) =>
                    setMantenimientoData({ ...mantenimientoData, descripcion: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="Motivo del mantenimiento o reparación técnica..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tipo de Mantenimiento
                  </label>
                  <select
                    value={mantenimientoData.tipo}
                    onChange={(e) =>
                      setMantenimientoData({ ...mantenimientoData, tipo: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="PREVENTIVO">PREVENTIVO</option>
                    <option value="CORRECTIVO">CORRECTIVO</option>
                    <option value="ACTUALIZACION">ACTUALIZACIÓN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Responsable Técnico
                  </label>
                  <input
                    type="text"
                    value={mantenimientoData.tecnico_responsable}
                    onChange={(e) =>
                      setMantenimientoData({
                        ...mantenimientoData,
                        tecnico_responsable: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    required
                    value={mantenimientoData.fecha_inicio}
                    onChange={(e) =>
                      setMantenimientoData({ ...mantenimientoData, fecha_inicio: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fecha Estimada Fin
                  </label>
                  <input
                    type="date"
                    value={mantenimientoData.fecha_fin}
                    onChange={(e) =>
                      setMantenimientoData({ ...mantenimientoData, fecha_fin: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                <span className="material-symbols-outlined text-base shrink-0">info</span>
                <span>
                  Al registrar el mantenimiento, el recurso se marcará automáticamente como en mantenimiento en el sistema.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMantenimientoModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl flex items-center gap-2 cursor-pointer font-space"
                >
                  <span className="material-symbols-outlined text-sm">build</span>
                  <span>Registrar Orden</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR RECURSO */}
      {showDeleteModal && selectedRecurso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">delete_forever</span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-800 font-space">
                ¿Eliminar recurso definitivamente?
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Estás a punto de eliminar{' '}
                <strong className="text-slate-800">
                  {selectedRecurso.codigo} - {selectedRecurso.nombre}
                </strong>{' '}
                del catálogo de recursos físicos. Esta acción no se puede deshacer.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={actionLoading}
                className="px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl flex items-center gap-2 cursor-pointer font-space"
              >
                {actionLoading ? (
                  <span className="material-symbols-outlined text-sm animate-spin">
                    progress_activity
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-sm">delete</span>
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

export default AdminRecursos;
