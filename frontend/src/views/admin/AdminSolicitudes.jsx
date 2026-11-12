import React, { useState, useMemo } from 'react';
import useAdminSolicitudes, { TRANSICIONES_ESTADO } from '../../hooks/useAdminSolicitudes';

export const AdminSolicitudes = () => {
  const {
    solicitudes,
    loading,
    actionLoading,
    refetch,
    getDetalleSolicitud,
    updateEstado,
    assignResponsable,
  } = useAdminSolicitudes();

  const [tabEstado, setTabEstado] = useState('TODAS');
  const [dependenciaFiltro, setDependenciaFiltro] = useState('TODAS');
  const [busqueda, setBusqueda] = useState('');

  // Modales
  const [solicitudDetalle, setSolicitudDetalle] = useState(null);
  const [historialDetalle, setHistorialDetalle] = useState([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  const [solicitudCambioEstado, setSolicitudCambioEstado] = useState(null);
  const [nuevoEstadoSeleccionado, setNuevoEstadoSeleccionado] = useState('');
  const [observacionCambio, setObservacionCambio] = useState('');
  const [respuestaFinal, setRespuestaFinal] = useState('');
  const [badRequestError, setBadRequestError] = useState(null);

  const [solicitudAsignar, setSolicitudAsignar] = useState(null);
  const [responsableNombre, setResponsableNombre] = useState('Carlos Pérez');
  const [responsableId, setResponsableId] = useState(3);

  const [toast, setToast] = useState(null);

  const showToast = (type, title, desc) => {
    setToast({ type, title, desc });
    setTimeout(() => setToast(null), 3500);
  };

  // Dependencias únicas
  const dependenciasList = useMemo(() => {
    const setDeps = new Set(solicitudes.map((s) => s.dependencia).filter(Boolean));
    return Array.from(setDeps);
  }, [solicitudes]);

  // Filtrado de solicitudes
  const solicitudesFiltradas = useMemo(() => {
    return solicitudes.filter((s) => {
      const matchEstado = tabEstado === 'TODAS' || s.estado === tabEstado;
      const matchDep = dependenciaFiltro === 'TODAS' || s.dependencia === dependenciaFiltro;
      const q = busqueda.toLowerCase().trim();
      const matchBusqueda =
        !q ||
        (s.asunto || '').toLowerCase().includes(q) ||
        (s.usuario_nombre || '').toLowerCase().includes(q) ||
        (s.dependencia || '').toLowerCase().includes(q) ||
        String(s.id).includes(q);

      return matchEstado && matchDep && matchBusqueda;
    });
  }, [solicitudes, tabEstado, dependenciaFiltro, busqueda]);

  // Abrir detalle con historial
  const handleAbrirDetalle = async (s) => {
    setSolicitudDetalle(s);
    setLoadingDetalle(true);
    const res = await getDetalleSolicitud(s.id);
    if (res.ok) {
      setHistorialDetalle(res.historial || []);
    } else {
      setHistorialDetalle([]);
    }
    setLoadingDetalle(false);
  };

  // Abrir modal de cambio de estado
  const handleAbrirModalCambioEstado = (s) => {
    setSolicitudCambioEstado(s);
    const permitidos = TRANSICIONES_ESTADO[s.estado] || [];
    setNuevoEstadoSeleccionado(permitidos[0] || '');
    setObservacionCambio('');
    setRespuestaFinal(s.respuesta_final || '');
    setBadRequestError(null);
  };

  // Enviar cambio de estado a la API
  const handleConfirmarCambioEstado = async (e) => {
    e.preventDefault();
    if (!solicitudCambioEstado || !nuevoEstadoSeleccionado) return;

    setBadRequestError(null);
    const res = await updateEstado(
      solicitudCambioEstado.id,
      nuevoEstadoSeleccionado,
      observacionCambio,
      respuestaFinal
    );

    if (res.ok) {
      showToast('success', 'Estado Actualizado', res.message);
      setSolicitudCambioEstado(null);
    } else if (res.badRequest) {
      // Error 400 Bad Request capturado adecuadamente
      setBadRequestError(res.message);
    } else {
      showToast('error', 'Error al Actualizar', res.message);
    }
  };

  // Enviar asignación de responsable
  const handleConfirmarAsignacion = async (e) => {
    e.preventDefault();
    if (!solicitudAsignar) return;

    const res = await assignResponsable(solicitudAsignar.id, responsableId, responsableNombre);
    if (res.ok) {
      showToast('success', 'Responsable Asignado', res.message);
      setSolicitudAsignar(null);
    } else {
      showToast('error', 'Error al Asignar', res.message);
    }
  };

  const getBadgeEstado = (estado) => {
    switch (estado) {
      case 'REGISTRADA':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'EN_REVISION':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ASIGNADA':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'EN_PROCESO':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'RESUELTA':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CERRADA':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden text-slate-800">

      {/* Toast Flotante */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 flex items-start gap-3 p-4 rounded-xl shadow-xl border text-xs max-w-sm animate-in slide-in-from-top-4 duration-200 ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' :
          toast.type === 'error' ? 'bg-rose-50 border-rose-300 text-rose-900' :
          'bg-blue-50 border-blue-300 text-blue-900'
        }`}>
          <span className="material-symbols-outlined text-[20px] shrink-0">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <div>
            <h4 className="font-bold font-space">{toast.title}</h4>
            <p className="mt-0.5 leading-relaxed">{toast.desc}</p>
          </div>
        </div>
      )}

      {/* ── Banner Institucional ─────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#081f56] via-[#0a47b8] to-blue-600 rounded-xl p-6 text-white relative overflow-hidden shadow-xl">
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[10px] font-space font-semibold uppercase tracking-wider text-blue-100">
            <span className="material-symbols-outlined text-[14px]">fact_check</span>
            <span>Microservicio ms-solicitudes (:3003) • Máquina de Estados Finita</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-space text-white">
            Auditoría y Gestión de Trámites Académicos
          </h1>
          <p className="text-xs text-blue-100/90 max-w-2xl">
            Control del ciclo de vida estricto: REGISTRADA ➔ EN_REVISION ➔ ASIGNADA ➔ EN_PROCESO ➔ RESUELTA ➔ CERRADA con historial de trazabilidad en PostgreSQL.
          </p>
        </div>
      </div>

      {/* ── Tabs de Estados y Filtros ─────────────────────────────────── */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs space-y-3">
        {/* Tabs de Estado */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-3">
          {['TODAS', 'REGISTRADA', 'EN_REVISION', 'ASIGNADA', 'EN_PROCESO', 'RESUELTA', 'CERRADA'].map((tab) => {
            const count = tab === 'TODAS'
              ? solicitudes.length
              : solicitudes.filter((s) => s.estado === tab).length;
            const isActive = tabEstado === tab;

            return (
              <button
                key={tab}
                onClick={() => setTabEstado(tab)}
                type="button"
                className={`px-3 py-1.5 rounded-xl text-xs font-space font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-[#0a47b8] text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/70'
                }`}
              >
                <span>{tab}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Buscador y Dependencia */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">search</span>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por asunto, solicitante, dependencia o # radicado..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0a47b8]"
            />
          </div>

          <div className="w-full sm:w-56 shrink-0">
            <select
              value={dependenciaFiltro}
              onChange={(e) => setDependenciaFiltro(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-space cursor-pointer"
            >
              <option value="TODAS">Todas las dependencias</option>
              {dependenciasList.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => refetch()}
            disabled={loading}
            type="button"
            className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold font-space flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span className={`material-symbols-outlined text-[16px] ${loading ? 'animate-spin text-blue-600' : ''}`}>
              refresh
            </span>
            <span>Recargar</span>
          </button>
        </div>
      </div>

      {/* ── Tabla de Solicitudes ──────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-3 border-[#0a47b8] border-t-transparent" />
            <p className="text-xs text-slate-500 font-space font-medium">Consultando solicitudes en db_solicitudes...</p>
          </div>
        ) : solicitudesFiltradas.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <span className="material-symbols-outlined text-slate-300 text-[40px]">inbox</span>
            <p className="text-sm font-bold text-slate-700 font-space">No se encontraron solicitudes</p>
            <p className="text-xs text-slate-500">No hay trámites que coincidan con los filtros aplicados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-space uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5 pl-4">Radicado</th>
                  <th className="p-3.5">Asunto / Trámite</th>
                  <th className="p-3.5">Solicitante</th>
                  <th className="p-3.5">Dependencia</th>
                  <th className="p-3.5">Responsable</th>
                  <th className="p-3.5 text-center">Estado</th>
                  <th className="p-3.5 text-right pr-4">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {solicitudesFiltradas.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 pl-4 font-mono font-bold text-[#0a47b8]">
                      #{String(s.id).padStart(4, '0')}
                    </td>
                    <td className="p-3.5 max-w-[220px]">
                      <span className="font-bold text-slate-900 block truncate" title={s.asunto}>
                        {s.asunto}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Prioridad: <span className="font-bold text-slate-600">{s.prioridad}</span>
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-800 block truncate">{s.usuario_nombre}</span>
                      <span className="text-[10px] text-slate-400 font-mono truncate">{s.usuario_email}</span>
                    </td>
                    <td className="p-3.5 text-slate-600 truncate max-w-[150px]">
                      {s.dependencia}
                    </td>
                    <td className="p-3.5 text-slate-600">
                      {s.responsable_nombre ? (
                        <span className="inline-flex items-center gap-1 font-medium text-slate-800">
                          <span className="material-symbols-outlined text-[14px] text-slate-400">person</span>
                          <span>{s.responsable_nombre}</span>
                        </span>
                      ) : (
                        <span className="text-amber-600 italic text-[11px]">Sin asignar</span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold font-space border ${getBadgeEstado(s.estado)}`}>
                        {s.estado}
                      </span>
                    </td>
                    <td className="p-3.5 text-right pr-4 space-x-1">
                      <button
                        onClick={() => handleAbrirDetalle(s)}
                        title="Ver Detalle e Historial de Trazabilidad"
                        type="button"
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-[#0a47b8]"
                      >
                        <span className="material-symbols-outlined text-[17px]">visibility</span>
                      </button>
                      <button
                        onClick={() => handleAbrirModalCambioEstado(s)}
                        title="Cambiar Estado (Máquina de Estados)"
                        type="button"
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-amber-50 hover:text-amber-700"
                      >
                        <span className="material-symbols-outlined text-[17px]">published_with_changes</span>
                      </button>
                      <button
                        onClick={() => setSolicitudAsignar(s)}
                        title="Asignar Responsable"
                        type="button"
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        <span className="material-symbols-outlined text-[17px]">person_add</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal Detalle e Historial de Trazabilidad ──────────────────── */}
      {solicitudDetalle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSolicitudDetalle(null)}
        >
          <div
            className="bg-white rounded-xl border border-slate-200 max-w-xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-[#081f56] to-blue-700 p-5 text-white flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-bold font-space uppercase tracking-widest text-blue-200">
                  Trámite #{String(solicitudDetalle.id).padStart(4, '0')} • db_solicitudes
                </span>
                <h3 className="text-base font-bold font-space text-white">{solicitudDetalle.asunto}</h3>
              </div>
              <button onClick={() => setSolicitudDetalle(null)} type="button" className="text-white/80 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Solicitante:</span>
                  <span className="font-bold text-slate-900">{solicitudDetalle.usuario_nombre} ({solicitudDetalle.usuario_email})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Dependencia:</span>
                  <span className="font-semibold text-slate-800">{solicitudDetalle.dependencia}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estado Actual:</span>
                  <span className={`inline-flex px-2 py-0.2 rounded-full text-[10px] font-bold font-space border ${getBadgeEstado(solicitudDetalle.estado)}`}>
                    {solicitudDetalle.estado}
                  </span>
                </div>
                <div className="pt-1 text-slate-700">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold font-space">Descripción:</span>
                  <p className="mt-0.5 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/80">
                    {solicitudDetalle.descripcion}
                  </p>
                </div>
                {solicitudDetalle.respuesta_final && (
                  <div className="pt-1 text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                    <span className="font-bold font-space block text-[10px] uppercase">Respuesta Oficial Resolutiva:</span>
                    <p className="mt-0.5 leading-relaxed">{solicitudDetalle.respuesta_final}</p>
                  </div>
                )}
              </div>

              {/* Trazabilidad de Estados */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold font-space text-slate-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#0a47b8] text-[16px]">history</span>
                  <span>Historial de Transiciones (historial_estados_solicitud)</span>
                </h4>

                {loadingDetalle ? (
                  <p className="text-slate-400 italic">Cargando bitácora de auditoría...</p>
                ) : historialDetalle.length === 0 ? (
                  <p className="text-slate-400 italic text-[11px]">No se registran transiciones previas. Estado inicial REGISTRADA.</p>
                ) : (
                  <div className="space-y-2 border-l-2 border-blue-200 ml-2 pl-3">
                    {historialDetalle.map((h, i) => (
                      <div key={i} className="space-y-0.5 text-[11px] relative">
                        <span className="absolute -left-[19px] top-1 h-2 w-2 rounded-full bg-[#0a47b8]" />
                        <div className="flex items-center gap-1.5 font-space font-bold">
                          <span className="text-slate-500">{h.estado_anterior}</span>
                          <span className="material-symbols-outlined text-[13px] text-slate-400">arrow_forward</span>
                          <span className="text-[#0a47b8]">{h.estado_nuevo}</span>
                        </div>
                        <p className="text-slate-600">{h.observacion}</p>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Por: {h.cambiado_por_nombre || 'Funcionario'} • {new Date(h.fecha_cambio).toLocaleString('es-CO')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setSolicitudDetalle(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs font-space cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Cambio de Estado (Máquina de Estados) ───────────────── */}
      {solicitudCambioEstado && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => !actionLoading && setSolicitudCambioEstado(null)}
        >
          <div
            className="bg-white rounded-xl border border-slate-200 max-w-lg w-full shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-[#081f56] to-blue-700 p-5 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold font-space uppercase tracking-widest text-blue-200">
                  Control de Ciclo de Vida • ms-solicitudes
                </span>
                <h3 className="text-base font-bold font-space text-white">Transición de Estado</h3>
              </div>
              <button onClick={() => setSolicitudCambioEstado(null)} disabled={actionLoading} type="button" className="text-white/80 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleConfirmarCambioEstado} className="p-5 space-y-4 text-xs">
              
              {/* Alerta de Error 400 Bad Request si se intentó salto no permitido */}
              {badRequestError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-start gap-2.5 animate-in slide-in-from-top-2">
                  <span className="material-symbols-outlined text-rose-600 text-[20px] shrink-0 mt-0.5">warning</span>
                  <div>
                    <strong className="font-space font-bold block text-rose-950">
                      ⚠️ Error HTTP 400: Violación de Máquina de Estados
                    </strong>
                    <p className="mt-0.5 leading-relaxed">{badRequestError}</p>
                  </div>
                </div>
              )}

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold font-space block">Estado Actual:</span>
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold font-space border mt-0.5 ${getBadgeEstado(solicitudCambioEstado.estado)}`}>
                    {solicitudCambioEstado.estado}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold font-space block">Transiciones Permitidas:</span>
                  <span className="font-mono text-[11px] font-bold text-slate-700">
                    {(TRANSICIONES_ESTADO[solicitudCambioEstado.estado] || []).join(' → ') || 'Ninguna (Cerrada)'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase font-space mb-1">
                  Seleccionar Nuevo Estado <span className="text-rose-500">*</span>
                </label>
                <select
                  value={nuevoEstadoSeleccionado}
                  onChange={(e) => {
                    setNuevoEstadoSeleccionado(e.target.value);
                    setBadRequestError(null);
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white cursor-pointer font-bold font-space text-slate-800"
                >
                  <option value="">Selecciona un estado...</option>
                  <option value="REGISTRADA">REGISTRADA</option>
                  <option value="EN_REVISION">EN_REVISION</option>
                  <option value="ASIGNADA">ASIGNADA</option>
                  <option value="EN_PROCESO">EN_PROCESO</option>
                  <option value="RESUELTA">RESUELTA</option>
                  <option value="CERRADA">CERRADA</option>
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  El backend validará estrictamente la regla de negocio. Los saltos ilegales devuelven 400 Bad Request.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase font-space mb-1">
                  Observación de Auditoría (Trazabilidad)
                </label>
                <textarea
                  rows={2}
                  value={observacionCambio}
                  onChange={(e) => setObservacionCambio(e.target.value)}
                  placeholder="Ej: Se verifica documentación de matrícula y se autoriza el paso a trámite..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white resize-none"
                />
              </div>

              {nuevoEstadoSeleccionado === 'RESUELTA' && (
                <div>
                  <label className="block text-[11px] font-bold text-emerald-800 uppercase font-space mb-1">
                    Respuesta Final / Documento Resolutivo Oficial
                  </label>
                  <textarea
                    rows={3}
                    value={respuestaFinal}
                    onChange={(e) => setRespuestaFinal(e.target.value)}
                    placeholder="Ej: Se expide Certificado de Estudio Oficial con radicado digital CERT-2026-89..."
                    className="w-full p-2.5 bg-emerald-50/50 border border-emerald-300 rounded-xl focus:bg-white resize-none"
                  />
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSolicitudCambioEstado(null)}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold font-space cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !nuevoEstadoSeleccionado}
                  className="px-5 py-2 rounded-xl bg-[#0a47b8] hover:bg-[#081f56] text-white text-xs font-bold font-space transition-all cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Verificando con backend...' : 'Aplicar Transición de Estado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Asignar Responsable ─────────────────────────────────── */}
      {solicitudAsignar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => !actionLoading && setSolicitudAsignar(null)}
        >
          <div
            className="bg-white rounded-xl border border-slate-200 max-w-md w-full shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-[#081f56] to-blue-700 p-5 text-white flex items-center justify-between">
              <h3 className="text-base font-bold font-space text-white">Asignar Funcionario Responsable</h3>
              <button onClick={() => setSolicitudAsignar(null)} disabled={actionLoading} type="button" className="text-white/80 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleConfirmarAsignacion} className="p-5 space-y-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-mono block">Solicitud:</span>
                <span className="font-bold text-slate-900">{solicitudAsignar.asunto} (#{solicitudAsignar.id})</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase font-space mb-1">
                  Funcionario Responsable
                </label>
                <select
                  value={responsableNombre}
                  onChange={(e) => {
                    setResponsableNombre(e.target.value);
                    setResponsableId(e.target.value === 'Carlos Pérez' ? 3 : 1);
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
                >
                  <option value="Carlos Pérez">Carlos Pérez (Coordinador Registro - ID #3)</option>
                  <option value="Administrador General">Administrador General (ID #1)</option>
                </select>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSolicitudAsignar(null)}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold font-space cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-[#0a47b8] hover:bg-[#081f56] text-white text-xs font-bold font-space disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? 'Asignando...' : 'Confirmar Asignación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminSolicitudes;
