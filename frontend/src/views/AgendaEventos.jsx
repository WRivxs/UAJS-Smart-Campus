import React, { useState, useMemo, useCallback } from 'react';
import useEventos from '../hooks/useEventos';
import { useAuth } from '../hooks/useAuth';
import EventCard from '../components/EventCard';
import EventDetailModal from '../components/EventDetailModal';

// Helper para formatear los nombres de categoría extraídos del backend
const formatCategoryLabel = (tipo) => {
  if (!tipo) return 'General';
  const MAP = {
    CONFERENCIA: 'Conferencias',
    TALLER: 'Talleres',
    SEMINARIO: 'Seminarios',
    INSTITUCIONAL: 'Institucional',
    ACTIVIDAD_INSTITUCIONAL: 'Institucional',
    ACADEMICO: 'Académicos',
    EVENTO_ACADEMICO: 'Académicos',
    DEPORTIVO: 'Deportivos',
    CULTURAL: 'Culturales',
  };
  if (MAP[tipo]) return MAP[tipo];
  return tipo
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

// Sistema Toast interno ------------------------------------------------
const useToast = () => {
  const [toast, setToast] = useState(null);
  const showToast = useCallback((type, title, desc) => {
    setToast({ type, title, desc });
    setTimeout(() => setToast(null), 3500);
  }, []);
  return { toast, showToast };
};

// ---------------------------------------------------------------------

export const AgendaEventos = () => {
  const { user, rol } = useAuth();
  const { eventos, misInscripciones, loading, actionLoading, refetch, inscribir, cancelar } = useEventos();
  const { toast, showToast } = useToast();

  const [tab, setTab] = useState('ALL');           // 'ALL' | 'REGISTERED'
  const [categoria, setCategoria] = useState('ALL');
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState('date-asc');
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);

  // Rol para mostrar botón "Proponer actividad"
  const puedeCrear = ['Administrador', 'Docente', 'Administrativo'].includes(rol || user?.rol_nombre);

  // ─── Extraer Categorías Dinámicas desde los datos reales ────────────
  const categoriasDinamicas = useMemo(() => {
    const tipos = new Set();
    eventos.forEach((ev) => {
      if (ev.tipo) tipos.add(ev.tipo);
    });
    const lista = [{ id: 'ALL', label: 'Todos' }];
    tipos.forEach((tipo) => {
      lista.push({
        id: tipo,
        label: formatCategoryLabel(tipo),
      });
    });
    return lista;
  }, [eventos]);

  // ─── Filtros ────────────────────────────────────────────────────────
  const eventosFiltrados = useMemo(() => {
    let fuente = tab === 'REGISTERED'
      ? eventos.filter((ev) => misInscripciones.includes(ev.id))
      : eventos;

    if (categoria !== 'ALL') {
      fuente = fuente.filter((ev) => ev.tipo === categoria);
    }

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      fuente = fuente.filter(
        (ev) =>
          ev.nombre?.toLowerCase().includes(q) ||
          ev.lugar_ubicacion?.toLowerCase().includes(q) ||
          ev.organizador_nombre?.toLowerCase().includes(q)
      );
    }

    return [...fuente].sort((a, b) => {
      if (orden === 'date-asc') return new Date(a.fecha_inicio) - new Date(b.fecha_inicio);
      if (orden === 'spots-desc') return (b.cupos_disponibles ?? 0) - (a.cupos_disponibles ?? 0);
      if (orden === 'name-asc') return (a.nombre || '').localeCompare(b.nombre || '');
      return 0;
    });
  }, [eventos, misInscripciones, tab, categoria, busqueda, orden]);

  // ─── KPIs ────────────────────────────────────────────────────────────
  const kpiTotal = eventos.filter((e) => e.estado !== 'FINALIZADO' && e.estado !== 'CANCELADO').length;
  const kpiInscritos = misInscripciones.length;
  const kpiEnCurso = eventos.filter((e) => e.estado === 'EN_CURSO').length;

  // ─── Acciones ────────────────────────────────────────────────────────
  const handleInscribir = async (id) => {
    const result = await inscribir(id);
    if (result.ok) {
      showToast('success', '¡Inscripción confirmada!', 'Tu lugar ha sido reservado con éxito.');
      if (eventoSeleccionado?.id === id) {
        setEventoSeleccionado((prev) => ({ ...prev, cupos_disponibles: Math.max(0, prev.cupos_disponibles - 1) }));
      }
    } else {
      showToast('error', 'Error al inscribirse', result.message || 'Intenta de nuevo.');
    }
  };

  const handleCancelar = async (id) => {
    const result = await cancelar(id);
    if (result.ok) {
      showToast('info', 'Inscripción cancelada', 'Tu cupo ha sido liberado correctamente.');
      if (eventoSeleccionado?.id === id) {
        setEventoSeleccionado((prev) => ({ ...prev, cupos_disponibles: prev.cupos_disponibles + 1 }));
      }
    } else {
      showToast('error', 'Error al cancelar', result.message || 'Intenta de nuevo.');
    }
  };

  return (
    <div className="space-y-6">

      {/* ── BANNER ────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#081f56] via-[#0a47b8] to-blue-600 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-24 top-0 w-32 h-32 rounded-full bg-cyan-400/20 blur-xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-cyan-200 border border-white/20 mb-3">
            <span className="material-symbols-outlined text-[15px]">school</span>
            <span>CORPORACIÓN UNIVERSITARIA ANTONIO JOSÉ DE SUCRE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-space text-white">
            Agenda de Eventos Campus
          </h1>
          <p className="mt-2 text-sm text-blue-100/90 leading-relaxed max-w-2xl">
            Explora el catálogo de conferencias, talleres, foros y actividades universitarias. Inscríbete con validación inmediata de aforo en tiempo real y gestiona tus reservas académicas.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => document.getElementById('eventos-grid-anchor')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-5 py-2.5 rounded-xl bg-white text-[#0a47b8] hover:bg-blue-50 font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Explorar Catálogo</span>
              <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
            </button>
            {puedeCrear && (
              <button className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold text-xs backdrop-blur-sm transition-all flex items-center gap-1.5 cursor-pointer">
                <span className="material-symbols-outlined text-[16px]">campaign</span>
                <span>Proponer actividad</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── KPIs ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Eventos Activos</p>
            <h3 className="text-3xl font-extrabold text-slate-900 font-space mt-1 group-hover:text-[#0a47b8] transition-colors">
              {loading ? '—' : kpiTotal}
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              Disponibles para inscripción
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-[#0a47b8] flex items-center justify-center group-hover:scale-105 group-hover:bg-[#0a47b8] group-hover:text-white transition-all shadow-sm">
            <span className="material-symbols-outlined text-[26px]">calendar_month</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mis Inscripciones</p>
            <h3 className="text-3xl font-extrabold text-[#0a47b8] font-space mt-1">
              {loading ? '—' : kpiInscritos}
            </h3>
            <p className="text-[11px] text-[#0a47b8] font-medium flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[14px]">confirmation_number</span>
              {kpiInscritos === 1 ? '1 evento reservado para ti' : `${kpiInscritos} eventos reservados`}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
            <span className="material-symbols-outlined text-[26px]">local_activity</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Eventos en Curso</p>
            <h3 className="text-3xl font-extrabold text-emerald-600 font-space mt-1 flex items-center gap-2">
              <span>{loading ? '—' : kpiEnCurso}</span>
              {kpiEnCurso > 0 && (
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[14px]">bolt</span>
              Actividades hoy en campus
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
            <span className="material-symbols-outlined text-[26px]">sensors</span>
          </div>
        </div>
      </div>

      {/* ── FILTROS / TABS / BÚSQUEDA ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-4">

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">

          {/* Tabs */}
          <div className="flex items-center p-1 bg-slate-100/90 rounded-xl max-w-md w-full sm:w-auto">
            <button
              onClick={() => setTab('ALL')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                tab === 'ALL' ? 'bg-white text-[#0a47b8] shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">view_agenda</span>
              <span>Catálogo General</span>
              <span className="text-[10px] bg-blue-50 text-[#0a47b8] px-1.5 rounded-full font-bold">{eventos.length}</span>
            </button>
            <button
              onClick={() => setTab('REGISTERED')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                tab === 'REGISTERED' ? 'bg-white text-[#0a47b8] shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
              <span>Mis Eventos Inscritos</span>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 rounded-full font-bold">{kpiInscritos}</span>
            </button>
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
              placeholder="Buscar por título, lugar u organizador..."
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

        {/* Pills de Categoría + Orden */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">filter_list</span>
              Categoría:
            </span>
            {categoriasDinamicas.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoria(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  categoria === cat.id
                    ? 'bg-[#0a47b8] text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200/70 text-slate-600'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Ordenar por:</span>
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0a47b8]"
            >
              <option value="date-asc">Fecha más próxima</option>
              <option value="spots-desc">Más cupos disponibles</option>
              <option value="name-asc">Nombre (A-Z)</option>
            </select>
          </div>
        </div>

      </div>

      {/* ── GRID DE EVENTOS ───────────────────────────────────────────── */}
      <div id="eventos-grid-anchor">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0a47b8] text-[20px]">event_available</span>
            {tab === 'REGISTERED' ? 'Mis Eventos Inscritos' : 'Eventos Disponibles'}
            <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-full border border-slate-200">
              Mostrando {eventosFiltrados.length}
            </span>
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:inline">Actualización en tiempo real vía API ms-eventos</span>
            <button
              onClick={refetch}
              title="Actualizar eventos"
              className="p-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:text-[#0a47b8] shadow-sm transition-all active:rotate-180 duration-300 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl h-72 animate-pulse">
                <div className="h-28 bg-slate-200 rounded-t-2xl" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-200 rounded-lg w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="h-3 bg-slate-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : eventosFiltrados.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200/90 text-center max-w-lg mx-auto my-8 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#0a47b8] flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <span className="material-symbols-outlined text-[32px]">event_busy</span>
            </div>
            <h3 className="text-base font-bold text-slate-800">
              {tab === 'REGISTERED' ? 'No tienes inscripciones activas' : 'No se encontraron eventos'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              {tab === 'REGISTERED'
                ? 'Explora el catálogo general e inscríbete en las actividades de tu interés.'
                : 'No hay actividades disponibles con los filtros seleccionados.'}
            </p>
            <button
              onClick={() => { setBusqueda(''); setCategoria('ALL'); setTab('ALL'); }}
              className="px-4 py-2 bg-[#0a47b8] text-white rounded-xl text-xs font-bold hover:bg-[#0b3ba4] transition-colors shadow-sm cursor-pointer"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventosFiltrados.map((ev) => (
              <EventCard
                key={ev.id}
                evento={ev}
                isInscrito={misInscripciones.includes(ev.id)}
                onVerDetalle={setEventoSeleccionado}
                onInscribir={handleInscribir}
                onCancelar={handleCancelar}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── MODAL DE DETALLE ──────────────────────────────────────────── */}
      {eventoSeleccionado && (
        <EventDetailModal
          evento={eventoSeleccionado}
          isInscrito={misInscripciones.includes(eventoSeleccionado.id)}
          onClose={() => setEventoSeleccionado(null)}
          onInscribir={handleInscribir}
          onCancelar={handleCancelar}
          actionLoading={actionLoading}
        />
      )}

      {/* ── TOAST ─────────────────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 max-w-sm bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in`}>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
            toast.type === 'error' ? 'bg-rose-500/20 text-rose-400' :
            'bg-blue-500/20 text-blue-400'
          }`}>
            <span className="material-symbols-outlined text-[20px]">
              {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info'}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-white">{toast.title}</p>
            <p className="text-[11px] text-slate-300">{toast.desc}</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default AgendaEventos;
