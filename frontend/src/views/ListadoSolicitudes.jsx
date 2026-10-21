import React, { useState, useMemo, useCallback } from 'react';
import useSolicitudes from '../hooks/useSolicitudes';
import CrearSolicitudModal from '../components/CrearSolicitudModal';
import FlujoSolicitudModal from '../components/FlujoSolicitudModal';

// Helper para formato de fechas
const formatFechaCompleta = (iso) => {
  if (!iso) return { fecha: 'Reciente', hora: '—' };
  const d = new Date(iso);
  const fecha = d.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const hora = d.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  return { fecha, hora };
};

// Generador de código formal para solicitudes
const getCodigo = (solicitud) => {
  if (solicitud.codigo) return solicitud.codigo;
  return `#SOL-${String(solicitud.id).padStart(3, '0')}`;
};

// Configuración visual por estado
const ESTADO_CONFIG = {
  REGISTRADA: {
    bg: 'bg-sky-50',
    text: 'text-sky-800',
    border: 'border-sky-200',
    dot: 'bg-sky-500',
    label: 'REGISTRADA',
  },
  EN_REVISION: {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    label: 'EN_REVISIÓN',
  },
  ASIGNADA: {
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
    label: 'ASIGNADA',
  },
  EN_PROCESO: {
    bg: 'bg-cyan-50',
    text: 'text-cyan-800',
    border: 'border-cyan-200',
    dot: 'bg-cyan-500',
    pulse: true,
    label: 'EN_PROCESO',
  },
  RESUELTA: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    label: 'RESUELTA',
  },
  CERRADA: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
    dot: 'bg-slate-500',
    label: 'CERRADA',
  },
};

// Configuración visual por prioridad
const PRIORIDAD_CONFIG = {
  ALTA: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Prioridad Alta' },
  MEDIA: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Prioridad Media' },
  BAJA: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', label: 'Prioridad Baja' },
};

// Sistema Toast ligero
const useToast = () => {
  const [toast, setToast] = useState(null);
  const showToast = useCallback((type, title, desc) => {
    setToast({ type, title, desc });
    setTimeout(() => setToast(null), 3800);
  }, []);
  return { toast, showToast };
};

export const ListadoSolicitudes = () => {
  const {
    solicitudes,
    loading,
    actionLoading,
    refetch,
    crearSolicitud,
    obtenerDetalle,
    cancelarSolicitud,
  } = useSolicitudes();

  const { toast, showToast } = useToast();

  // Estados de filtros
  const [tabEstado, setTabEstado] = useState('ALL');
  const [categoria, setCategoria] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState('recent');

  // Modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [solicitudDetalle, setSolicitudDetalle] = useState(null);
  const [historialDetalle, setHistorialDetalle] = useState([]);
  const [isTraceOpen, setIsTraceOpen] = useState(false);

  // ─── Métricas KPIs ──────────────────────────────────────────────
  const kpis = useMemo(() => {
    const total = solicitudes.length;
    const enTramite = solicitudes.filter((s) =>
      ['EN_REVISION', 'ASIGNADA', 'EN_PROCESO'].includes(s.estado)
    ).length;
    const resueltas = solicitudes.filter((s) =>
      ['RESUELTA', 'CERRADA'].includes(s.estado)
    ).length;
    const pendientes = solicitudes.filter((s) => s.estado === 'REGISTRADA').length;

    return { total, enTramite, resueltas, pendientes };
  }, [solicitudes]);

  // ─── Filtrado y Ordenación ──────────────────────────────────────
  const solicitudesFiltradas = useMemo(() => {
    let result = [...solicitudes];

    if (tabEstado === 'EN_PROCESO') {
      result = result.filter((s) => ['EN_REVISION', 'ASIGNADA', 'EN_PROCESO'].includes(s.estado));
    } else if (tabEstado === 'RESUELTA') {
      result = result.filter((s) => ['RESUELTA', 'CERRADA'].includes(s.estado));
    } else if (tabEstado === 'REGISTRADA') {
      result = result.filter((s) => s.estado === 'REGISTRADA');
    }

    if (categoria) {
      result = result.filter((s) => s.tipo === categoria);
    }

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      result = result.filter((s) => {
        const codigo = getCodigo(s).toLowerCase();
        const asunto = (s.asunto || '').toLowerCase();
        const dependencia = (s.dependencia || '').toLowerCase();
        const tipo = (s.tipo || '').toLowerCase();
        return (
          codigo.includes(q) ||
          asunto.includes(q) ||
          dependencia.includes(q) ||
          tipo.includes(q)
        );
      });
    }

    return result.sort((a, b) => {
      if (orden === 'recent') {
        return new Date(b.fecha_registro || 0) - new Date(a.fecha_registro || 0);
      }
      if (orden === 'code') {
        return (b.id || 0) - (a.id || 0);
      }
      if (orden === 'priority') {
        const pWeight = { ALTA: 3, MEDIA: 2, BAJA: 1 };
        return (pWeight[b.prioridad] || 0) - (pWeight[a.prioridad] || 0);
      }
      return 0;
    });
  }, [solicitudes, tabEstado, categoria, busqueda, orden]);

  // ─── Acciones ──────────────────────────────────────────────────
  const handleCrearSubmit = async (payload) => {
    const res = await crearSolicitud(payload);
    if (res.ok) {
      showToast('success', '¡Solicitud Radicada!', `Se ha generado el código ${getCodigo(res.data)} exitosamente.`);
      setIsCreateOpen(false);
    } else {
      showToast('error', 'Error al radicar', res.message || 'Por favor verifica los campos e intenta de nuevo.');
    }
  };

  const handleOpenTrazabilidad = async (solicitud) => {
    setSolicitudDetalle(solicitud);
    setIsTraceOpen(true);
    const res = await obtenerDetalle(solicitud.id);
    if (res.ok) {
      setHistorialDetalle(res.historial || []);
    } else {
      setHistorialDetalle([]);
    }
  };

  const handleCancelarSolicitud = async (id) => {
    if (!window.confirm('¿Confirmas que deseas cancelar esta solicitud? Esta acción no se puede deshacer.')) {
      return;
    }
    const res = await cancelarSolicitud(id);
    if (res.ok) {
      showToast('info', 'Solicitud Cancelada', res.message);
      setIsTraceOpen(false);
    } else {
      showToast('error', 'No se pudo cancelar', res.message);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      
      {/* ─── Toast Flotante ────────────────────────────────────────── */}
      {toast && (
        <div
          className={`fixed top-20 right-6 z-50 flex items-start gap-3 p-4 rounded-2xl shadow-xl border text-xs max-w-sm animate-in slide-in-from-top-4 duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : toast.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}
        >
          <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">
            {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info'}
          </span>
          <div className="flex-1">
            <h4 className="font-bold font-space text-sm">{toast.title}</h4>
            <p className="mt-0.5 opacity-90 leading-relaxed">{toast.desc}</p>
          </div>
        </div>
      )}

      {/* ─── 1. BANNER INSTITUCIONAL ──────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#081f56] via-[#0a47b8] to-blue-600 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-24 top-0 w-32 h-32 rounded-full bg-cyan-400/20 blur-xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-space text-white">
            Gestión de Solicitudes y Trámites
          </h1>

          <p className="text-sm text-blue-100/90 leading-relaxed max-w-2xl font-normal">
            Radica certificados oficiales, constancias, homologaciones y solicitudes académicas. Consulta el avance y trazabilidad de tus trámites en tiempo real con firma digital institucional.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsCreateOpen(true)}
              type="button"
              className="px-5 py-2.5 rounded-xl bg-white text-[#0a47b8] hover:bg-blue-50 font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer font-space transform hover:-translate-y-0.5"
            >
              <span className="material-symbols-outlined text-[18px] font-bold text-blue-600">add</span>
              <span>Radicar Nueva Solicitud</span>
            </button>
            <button
              onClick={() => setTabEstado('RESUELTA')}
              type="button"
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold text-xs backdrop-blur-sm transition-all flex items-center gap-1.5 cursor-pointer font-space"
            >
              <span className="material-symbols-outlined text-[18px] text-blue-200">history_edu</span>
              <span>Historial de Resueltas</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── 3. KPIS (ESTILO HOMOGÉNEO A EVENTOS) ─────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-space">Total Solicitudes</p>
            <h3 className="text-3xl font-extrabold text-slate-900 font-space mt-1 group-hover:text-[#0a47b8] transition-colors">
              {loading ? '—' : kpis.total}
            </h3>
            <p className="text-[11px] text-blue-600 font-medium flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[14px]">folder</span>
              {kpis.total} trámites registrados
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-[#0a47b8] flex items-center justify-center group-hover:scale-105 group-hover:bg-[#0a47b8] group-hover:text-white transition-all shadow-sm shrink-0">
            <span className="material-symbols-outlined text-[26px]">description</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-space">En Trámite</p>
            <h3 className="text-3xl font-extrabold text-amber-600 font-space mt-1">
              {loading ? '—' : kpis.enTramite}
            </h3>
            <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[14px]">pending_actions</span>
              {kpis.enTramite} en atención
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-105 group-hover:bg-amber-600 group-hover:text-white transition-all shadow-sm shrink-0">
            <span className="material-symbols-outlined text-[26px]">hourglass_top</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-space">Resueltas</p>
            <h3 className="text-3xl font-extrabold text-emerald-600 font-space mt-1 flex items-center gap-2">
              <span>{loading ? '—' : kpis.resueltas}</span>
              {kpis.resueltas > 0 && (
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
              )}
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[14px]">task_alt</span>
              {kpis.resueltas} documentos listos
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm shrink-0">
            <span className="material-symbols-outlined text-[26px]">check_circle</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-space">Pendientes</p>
            <h3 className="text-3xl font-extrabold text-sky-600 font-space mt-1">
              {loading ? '—' : kpis.pendientes}
            </h3>
            <p className="text-[11px] text-sky-600 font-medium flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              {kpis.pendientes} registradas
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center group-hover:scale-105 group-hover:bg-sky-600 group-hover:text-white transition-all shadow-sm shrink-0">
            <span className="material-symbols-outlined text-[26px]">history</span>
          </div>
        </div>
      </div>

      {/* ─── 4. FILTROS / TABS / BÚSQUEDA ─────────────────────────── */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          
          {/* Tabs */}
          <div className="flex items-center p-1 bg-slate-100/90 rounded-xl overflow-x-auto max-w-full">
            {[
              { id: 'ALL', label: 'Todas', icon: 'view_agenda', count: kpis.total },
              { id: 'EN_PROCESO', label: 'En Trámite', icon: 'pending_actions', count: kpis.enTramite },
              { id: 'RESUELTA', label: 'Resueltas', icon: 'check_circle', count: kpis.resueltas },
              { id: 'REGISTRADA', label: 'Registradas', icon: 'schedule', count: kpis.pendientes },
            ].map((t) => {
              const isActive = tabEstado === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTabEstado(t.id)}
                  type="button"
                  className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold font-space transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-[#0a47b8] shadow-sm border border-slate-200/60'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
                  <span>{t.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-blue-50 text-[#0a47b8]' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Buscador */}
          <div className="relative flex-1 lg:max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <span className="material-symbols-outlined text-[18px]">search</span>
            </span>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por radicado, asunto, o dependencia..."
              className="w-full pl-9 pr-9 py-2 bg-slate-50 focus:bg-white text-xs text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:border-[#0a47b8] focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Categoría Pills & Orden */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">filter_list</span>
              Categoría:
            </span>
            {[
              { id: '', label: 'Todos' },
              { id: 'CERTIFICADO', label: 'Certificados' },
              { id: 'ACADEMICA', label: 'Académicas' },
              { id: 'ADMINISTRATIVA', label: 'Administrativas' },
              { id: 'SERVICIO', label: 'Servicios' },
            ].map((c) => {
              const isSelected = categoria === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setCategoria(c.id)}
                  type="button"
                  className={`px-3 py-1.5 rounded-full text-xs font-space transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0a47b8] text-white font-bold shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium'
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-xs text-slate-400 font-medium">Ordenar por:</span>
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              className="py-1 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="recent">Fecha más reciente</option>
              <option value="code">Código de radicado</option>
              <option value="priority">Prioridad más alta</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── 5. TABLA DE TRÁMITES RADICADOS ────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden w-full">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 text-[#0a47b8] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[18px]">folder_shared</span>
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight font-space">
                Mis Trámites Radicados
              </h2>
              <p className="text-[11px] text-slate-400 font-normal">
                Seguimiento en línea y trazabilidad oficial
              </p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold font-space">
            {solicitudesFiltradas.length} encontrados
          </span>
        </div>

        {/* Contenedor scrollable horizontal para evitar desbordamiento */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-space">
                <th className="py-3.5 px-5">Código / Radicado</th>
                <th className="py-3.5 px-4">Asunto & Tipo</th>
                <th className="py-3.5 px-4">Dependencia / Responsable</th>
                <th className="py-3.5 px-4">Estado del Trámite</th>
                <th className="py-3.5 px-4">Fecha Radicación</th>
                <th className="py-3.5 px-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    <div className="flex justify-center items-center gap-2">
                      <span className="w-4 h-4 border-2 border-[#0a47b8] border-t-transparent rounded-full animate-spin" />
                      <span>Cargando solicitudes desde el backend distribuido...</span>
                    </div>
                  </td>
                </tr>
              ) : solicitudesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    <span className="material-symbols-outlined text-[36px] text-slate-300 block mb-2">
                      inbox
                    </span>
                    <p className="font-semibold text-slate-600">No se encontraron trámites con los filtros actuales</p>
                    <p className="text-slate-400 text-[11px] mt-1">Prueba cambiando los filtros o radica una nueva solicitud.</p>
                  </td>
                </tr>
              ) : (
                solicitudesFiltradas.map((sol) => {
                  const est = ESTADO_CONFIG[sol.estado] || ESTADO_CONFIG.REGISTRADA;
                  const prio = PRIORIDAD_CONFIG[sol.prioridad] || PRIORIDAD_CONFIG.MEDIA;
                  const { fecha, hora } = formatFechaCompleta(sol.fecha_registro);
                  const codigo = getCodigo(sol);

                  return (
                    <tr key={sol.id} className="hover:bg-blue-50/30 transition-colors">
                      {/* Código */}
                      <td className="py-3.5 px-5 font-mono font-bold text-[#0a47b8]">
                        <span className="inline-flex items-center space-x-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${est.dot} ring-2 ring-blue-100`} />
                          <span className="tracking-tight text-xs sm:text-sm">{codigo}</span>
                        </span>
                      </td>

                      {/* Asunto & Tipo */}
                      <td className="py-3.5 px-4 max-w-[280px]">
                        <div className="font-bold text-slate-900 leading-snug line-clamp-1">
                          {sol.asunto}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase bg-sky-100 text-sky-800 font-space">
                            {sol.tipo || 'TRÁMITE'}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${prio.bg} ${prio.text} ${prio.border}`}
                          >
                            {prio.label}
                          </span>
                        </div>
                      </td>

                      {/* Dependencia & Responsable */}
                      <td className="py-3.5 px-4 text-xs max-w-[220px]">
                        <div className="font-semibold text-slate-800 flex items-center space-x-1.5 truncate">
                          <span className="material-symbols-outlined text-[15px] text-blue-600 shrink-0">
                            account_balance
                          </span>
                          <span className="truncate">{sol.dependencia}</span>
                        </div>
                        <div className="text-slate-500 flex items-center space-x-1 mt-0.5 text-[11px] truncate">
                          <span className="material-symbols-outlined text-[14px] text-slate-400 shrink-0">
                            person
                          </span>
                          <span className="truncate">
                            {sol.responsable_nombre || 'Asignación automática'}
                          </span>
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border font-space ${est.bg} ${est.text} ${est.border}`}
                        >
                          <span
                            className={`w-2 h-2 mr-1.5 rounded-full ${est.dot} ${
                              est.pulse ? 'animate-pulse' : ''
                            }`}
                          />
                          {est.label}
                        </span>
                      </td>

                      {/* Fecha */}
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        <div className="font-medium text-slate-800">{fecha}</div>
                        <div className="text-slate-400 font-mono text-[11px]">{hora}</div>
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleOpenTrazabilidad(sol)}
                            type="button"
                            className="inline-flex items-center px-3 py-1.5 rounded-xl bg-blue-50 text-[#0a47b8] hover:bg-blue-100 text-xs font-bold font-space transition-colors border border-blue-200/60 cursor-pointer"
                          >
                            Trazabilidad
                          </button>
                          <button
                            onClick={() => handleOpenTrazabilidad(sol)}
                            type="button"
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Descargar comprobante de radicado"
                          >
                            <span className="material-symbols-outlined text-[18px]">download</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="bg-slate-50/80 border-t border-slate-200 px-5 py-3 flex items-center justify-between text-xs text-slate-500">
          <div>
            Mostrando <span className="font-bold text-slate-800">{solicitudesFiltradas.length}</span> de{' '}
            <span className="font-bold text-slate-800">{solicitudes.length}</span> trámites registrados
          </div>
          <div className="flex items-center space-x-1 font-mono text-[11px] text-slate-400">
            <span>Sistemas Distribuidos UNIAJS • PostgreSQL 15</span>
          </div>
        </div>
      </div>

      {/* ─── MODALES ──────────────────────────────────────────────── */}
      <CrearSolicitudModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCrearSubmit}
        actionLoading={actionLoading}
      />

      <FlujoSolicitudModal
        isOpen={isTraceOpen}
        onClose={() => setIsTraceOpen(false)}
        solicitud={solicitudDetalle}
        historial={historialDetalle}
        onCancelar={handleCancelarSolicitud}
        actionLoading={actionLoading}
      />
    </div>
  );
};

export default ListadoSolicitudes;
