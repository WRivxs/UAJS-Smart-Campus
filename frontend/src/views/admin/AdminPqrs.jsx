import React, { useState, useMemo } from 'react';
import useAdminPqrs from '../../hooks/useAdminPqrs';

export const AdminPqrs = () => {
  const {
    pqrsList,
    loading,
    actionLoading,
    refetch,
    getDetallePqrs,
    responderPqrs,
    eliminarPqrs,
  } = useAdminPqrs();

  const [tabEstado, setTabEstado] = useState('TODAS');
  const [tipoFiltro, setTipoFiltro] = useState('TODOS');
  const [busqueda, setBusqueda] = useState('');

  // Modales
  const [pqrsDetalle, setPqrsDetalle] = useState(null);
  const [respuestasDetalle, setRespuestasDetalle] = useState([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  const [pqrsAResponder, setPqrsAResponder] = useState(null);
  const [mensajeRespuesta, setMensajeRespuesta] = useState('');

  const [pqrsAEliminar, setPqrsAEliminar] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (type, title, desc) => {
    setToast({ type, title, desc });
    setTimeout(() => setToast(null), 3500);
  };

  const safePqrsList = useMemo(() => (Array.isArray(pqrsList) ? pqrsList : []), [pqrsList]);

  const pqrsFiltradas = useMemo(() => {
    return safePqrsList.filter((p) => {
      if (!p || typeof p !== 'object') return false;
      const matchEstado = tabEstado === 'TODAS' || p.estado === tabEstado;
      const matchTipo = tipoFiltro === 'TODOS' || p.tipo === tipoFiltro;
      const q = busqueda.toLowerCase().trim();
      const matchBusqueda =
        !q ||
        (p.asunto || '').toLowerCase().includes(q) ||
        (p.numero_ticket || '').toLowerCase().includes(q) ||
        (p.usuario_nombre || '').toLowerCase().includes(q) ||
        (p.dependencia_destino || '').toLowerCase().includes(q);

      return matchEstado && matchTipo && matchBusqueda;
    });
  }, [safePqrsList, tabEstado, tipoFiltro, busqueda]);

  const handleAbrirDetalle = async (p) => {
    setPqrsDetalle(p);
    setLoadingDetalle(true);
    const res = await getDetallePqrs(p.id);
    if (res.ok) {
      setRespuestasDetalle(res.respuestas || []);
    } else {
      setRespuestasDetalle([]);
    }
    setLoadingDetalle(false);
  };

  const handleConfirmarRespuesta = async (e) => {
    e.preventDefault();
    if (!pqrsAResponder || !mensajeRespuesta.trim()) return;

    const res = await responderPqrs(pqrsAResponder.id, mensajeRespuesta.trim());
    if (res.ok) {
      showToast('success', 'PQRS Respondida', res.message);
      setPqrsAResponder(null);
      setMensajeRespuesta('');
    } else {
      showToast('error', 'Error al Responder', res.message);
    }
  };

  const handleConfirmarEliminar = async () => {
    if (!pqrsAEliminar) return;
    const res = await eliminarPqrs(pqrsAEliminar.id);
    if (res.ok) {
      showToast('info', 'Radicado Eliminado', res.message);
      setPqrsAEliminar(null);
    } else {
      showToast('error', 'Error al Eliminar', res.message);
    }
  };

  const getBadgeEstado = (estado) => {
    switch (estado) {
      case 'RECIBIDA':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'EN_TRAMITE':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'RESPONDIDA':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CERRADA':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden text-slate-800">
      
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
            <span className="material-symbols-outlined text-[14px]">support_agent</span>
            <span>Atención al Ciudadano y PQRS</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-space text-white">
            Atención Institucional de PQRS
          </h1>
          <p className="text-xs text-blue-100/90 max-w-2xl">
            Gestión, atención y emisión de respuestas oficiales a peticiones, quejas, reclamos y sugerencias de la comunidad universitaria.
          </p>
        </div>
      </div>

      {/* ── Filtros y Búsqueda ────────────────────────────────────────── */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-3">
          {['TODAS', 'RECIBIDA', 'EN_TRAMITE', 'RESPONDIDA', 'CERRADA'].map((tab) => {
            const count = tab === 'TODAS'
              ? pqrsList.length
              : pqrsList.filter((p) => p.estado === tab).length;
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

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">search</span>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por radicado, asunto, solicitante o dependencia..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0a47b8]"
            />
          </div>

          <div className="w-full sm:w-48 shrink-0">
            <select
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-space cursor-pointer"
            >
              <option value="TODOS">Todos los tipos</option>
              <option value="PETICION">Petición</option>
              <option value="QUEJA">Queja</option>
              <option value="RECLAMO">Reclamo</option>
              <option value="SUGERENCIA">Sugerencia</option>
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

      {/* ── Tabla de PQRS ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-3 border-[#0a47b8] border-t-transparent" />
            <p className="text-xs text-slate-500 font-space font-medium">Consultando radicados de atención ciudadana...</p>
          </div>
        ) : pqrsFiltradas.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <span className="material-symbols-outlined text-slate-300 text-[40px]">mark_email_read</span>
            <p className="text-sm font-bold text-slate-700 font-space">No se encontraron tickets de PQRS</p>
            <p className="text-xs text-slate-500">No hay radicados que coincidan con los filtros seleccionados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-space uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5 pl-4">Radicado Oficial</th>
                  <th className="p-3.5">Tipo</th>
                  <th className="p-3.5">Asunto</th>
                  <th className="p-3.5">Solicitante</th>
                  <th className="p-3.5">Dependencia</th>
                  <th className="p-3.5 text-center">Estado</th>
                  <th className="p-3.5 text-right pr-4">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pqrsFiltradas.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 pl-4 font-mono font-bold text-[#0a47b8]">
                      {p.numero_ticket}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-space bg-slate-100 border border-slate-200 text-slate-700">
                        {p.tipo}
                      </span>
                    </td>
                    <td className="p-3.5 max-w-[200px]">
                      <span className="font-bold text-slate-900 block truncate" title={p.asunto}>{p.asunto}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(p.fecha_registro).toLocaleDateString('es-CO')}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-700">
                      {p.anonimo ? (
                        <span className="italic text-slate-400">Anónimo</span>
                      ) : (
                        <div>
                          <span className="font-semibold block">{p.usuario_nombre}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{p.usuario_email}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-600 truncate max-w-[140px]">
                      {p.dependencia_destino}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold font-space border ${getBadgeEstado(p.estado)}`}>
                        {p.estado}
                      </span>
                    </td>
                    <td className="p-3.5 text-right pr-4 space-x-1">
                      <button
                        onClick={() => handleAbrirDetalle(p)}
                        title="Ver Radicado y Respuestas"
                        type="button"
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-[#0a47b8]"
                      >
                        <span className="material-symbols-outlined text-[17px]">visibility</span>
                      </button>
                      <button
                        onClick={() => {
                          setPqrsAResponder(p);
                          setMensajeRespuesta('');
                        }}
                        title="Responder Oficialmente"
                        type="button"
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <span className="material-symbols-outlined text-[17px]">reply</span>
                      </button>
                      <button
                        onClick={() => setPqrsAEliminar(p)}
                        title="Eliminar Radicado"
                        type="button"
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-rose-50 hover:text-rose-700"
                      >
                        <span className="material-symbols-outlined text-[17px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal Responder PQRS ───────────────────────────────────────── */}
      {pqrsAResponder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => !actionLoading && setPqrsAResponder(null)}
        >
          <div
            className="bg-white rounded-xl border border-slate-200 max-w-lg w-full shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-[#081f56] to-blue-700 p-5 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold font-space uppercase tracking-widest text-blue-200">
                  Respuesta Oficial de Radicado
                </span>
                <h3 className="text-base font-bold font-space text-white">{pqrsAResponder.numero_ticket}</h3>
              </div>
              <button onClick={() => setPqrsAResponder(null)} disabled={actionLoading} type="button" className="text-white/80 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleConfirmarRespuesta} className="p-5 space-y-3.5 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase font-space block">Asunto Radicado:</span>
                <p className="font-bold text-slate-900">{pqrsAResponder.asunto}</p>
                <p className="text-slate-600 italic mt-1 leading-relaxed">"{pqrsAResponder.descripcion}"</p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase font-space mb-1">
                  Respuesta Institucional <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={mensajeRespuesta}
                  onChange={(e) => setMensajeRespuesta(e.target.value)}
                  placeholder="Redacta la respuesta oficial de la Universidad. Se notificará al solicitante y se actualizará el estado a RESPONDIDA..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white resize-none leading-relaxed"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPqrsAResponder(null)}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold font-space cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !mensajeRespuesta.trim()}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-space transition-all cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Enviando...' : 'Emitir Respuesta Oficial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Detalle Radicado ────────────────────────────────────── */}
      {pqrsDetalle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setPqrsDetalle(null)}
        >
          <div
            className="bg-white rounded-xl border border-slate-200 max-w-lg w-full shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-[#081f56] to-blue-700 p-5 text-white flex items-center justify-between shrink-0">
              <h3 className="text-base font-bold font-space text-white">Detalle Radicado {pqrsDetalle.numero_ticket}</h3>
              <button onClick={() => setPqrsDetalle(null)} type="button" className="text-white/80 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-5 space-y-3 overflow-y-auto text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tipo:</span>
                  <span className="font-bold text-slate-900">{pqrsDetalle.tipo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Dependencia:</span>
                  <span className="font-semibold text-slate-800">{pqrsDetalle.dependencia_destino}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estado:</span>
                  <span className={`inline-flex px-2 py-0.2 rounded-full text-[10px] font-bold border ${getBadgeEstado(pqrsDetalle.estado)}`}>
                    {pqrsDetalle.estado}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase font-space block">Asunto & Contenido:</span>
                <p className="font-bold text-slate-900 mt-0.5">{pqrsDetalle.asunto}</p>
                <p className="mt-1 bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
                  {pqrsDetalle.descripcion}
                </p>
              </div>

              {loadingDetalle && (
                <div className="flex items-center justify-center p-3 text-slate-400 gap-2">
                  <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                  <span>Cargando hilo de respuestas...</span>
                </div>
              )}

              {respuestasDetalle.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-space block">
                    Historial de Respuestas Oficiales ({respuestasDetalle.length}):
                  </span>
                  {respuestasDetalle.map((r) => (
                    <div key={r.id} className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-900">
                      <div className="flex justify-between items-center text-[10px] text-emerald-700 font-semibold mb-1">
                        <span>{r.usuario_nombre || 'Administración'}</span>
                        <span>{new Date(r.created_at).toLocaleString()}</span>
                      </div>
                      <p className="leading-relaxed">{r.mensaje}</p>
                    </div>
                  ))}
                </div>
              )}

              {pqrsDetalle.respuesta && respuestasDetalle.length === 0 && (
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-900">
                  <span className="font-bold font-space block text-[10px] uppercase">Respuesta Registrada:</span>
                  <p className="mt-1 leading-relaxed">{pqrsDetalle.respuesta}</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setPqrsDetalle(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-800 font-semibold text-xs font-space cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Confirmar Eliminar ──────────────────────────────────── */}
      {pqrsAEliminar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => !actionLoading && setPqrsAEliminar(null)}
        >
          <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[28px]">delete_forever</span>
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold font-space text-slate-900">¿Eliminar radicado PQRS?</h3>
              <p className="text-xs text-slate-600">
                Se eliminará el ticket <strong className="text-slate-900">{pqrsAEliminar.numero_ticket}</strong> del sistema.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPqrsAEliminar(null)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold font-space"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarEliminar}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold font-space disabled:opacity-50"
              >
                {actionLoading ? 'Eliminando...' : 'Sí, Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPqrs;
