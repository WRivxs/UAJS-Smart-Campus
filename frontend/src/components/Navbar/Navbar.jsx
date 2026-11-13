import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import useProfile from '../../hooks/useProfile';
import useNotificaciones from '../../hooks/useNotificaciones';

// Formato de fecha relativo o corto
const formatRelativo = (isoDate) => {
  if (!isoDate) return 'Reciente';
  const d = new Date(isoDate);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 2) return 'Hace un momento';
  if (diffMins < 60) return `Hace ${diffMins}m`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays === 1) return 'Ayer';
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
};

// Ícono y color según tipo de notificación
const getNotifIconConfig = (tipo) => {
  switch (tipo?.toUpperCase()) {
    case 'CONFIRMACION_RESERVA':
      return { icon: 'event_available', color: 'text-emerald-600', bg: 'bg-emerald-50', target: 'reservas' };
    case 'RECHAZO_RESERVA':
      return { icon: 'event_busy', color: 'text-rose-600', bg: 'bg-rose-50', target: 'reservas' };
    case 'CAMBIO_ESTADO_SOLICITUD':
      return { icon: 'description', color: 'text-blue-600', bg: 'bg-blue-50', target: 'solicitudes' };
    case 'NUEVA_PQRS':
      return { icon: 'support_agent', color: 'text-purple-600', bg: 'bg-purple-50', target: 'pqrs' };
    case 'EVENTO_NUEVO':
      return { icon: 'event', color: 'text-cyan-600', bg: 'bg-cyan-50', target: 'eventos' };
    default:
      return { icon: 'notifications', color: 'text-slate-600', bg: 'bg-slate-50', target: null };
  }
};

export const Navbar = ({ title = "Smart Campus", onToggleSidebar, onNavigateTab = () => {} }) => {
  const { user, logout, rol } = useAuth();
  const { profile } = useProfile();
  const {
    notificaciones,
    noLeidasCount,
    loading: notifLoading,
    marcarLeida,
    marcarTodasLeidas,
  } = useNotificaciones();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const modalRef = useRef(null);
  const notifRef = useRef(null);

  // Detección del rol oficial desde PostgreSQL (1: Administrador, 2: Docente, 3: Administrativo, 4: Estudiante)
  const currentRole = profile?.rol_nombre || user?.rol_nombre || rol || "Estudiante";
  const roleId = Number(profile?.rol_id || user?.rol_id);
  const isAdmin = currentRole === "Administrador" || roleId === 1;
  const isFuncionario = isAdmin || currentRole === "Administrativo" || roleId === 3;

  const displayName = profile?.nombre || user?.nombre || "Usuario Institucional";
  const displayEmail = profile?.email || user?.email || "";
  const displayCodigo = profile?.codigo_estudiantil || user?.codigo_estudiantil || (isFuncionario ? (isAdmin ? "ADM-001" : "ADM-205") : "N/A");
  const displayFacultad = profile?.facultad_departamento || profile?.facultad || user?.facultad_departamento || user?.facultad || (isFuncionario ? (isAdmin ? "Dirección de Tecnologías de la Información" : "Registro y Control Académico") : "Facultad de Ingenierías");

  const displaySubtitle = profile?.cargo || profile?.programa_academico || user?.cargo || user?.programa_academico || `${currentRole} Institucional`;

  // Helper para obtener iniciales
  const getInitials = (name) => {
    if (!name) return 'UA';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Cerrar modales al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsModalOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="w-full fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 md:px-8 h-16 bg-white border-b border-slate-200/90 shadow-xs">
      
      {/* Izquierda: Botón de Menú + Logo Oficial y Marca */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          title="Alternar Menú Lateral"
          className="p-2 rounded-xl text-slate-600 hover:text-[#0284c7] hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer select-none"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        <img 
          src="/Logo-SPLAVIA-5.0.png" 
          alt="Logo Corporación Universitaria Antonio José de Sucre" 
          className="h-9 md:h-10 w-auto object-contain cursor-pointer"
        />
        <div className="h-6 w-[1px] bg-slate-200 hidden sm:block"></div>
        <div className="flex flex-col hidden sm:flex">
          <span className="text-xs font-bold tracking-tight text-[#0284c7] uppercase font-space">
            UAJS {title}
          </span>
          <span className="text-[10px] text-slate-500 font-space">
            Plataforma Institucional
          </span>
        </div>
      </div>

      {/* Derecha: Notificaciones + Perfil interactivo */}
      <div className="flex items-center gap-3 md:gap-4 relative">
        
        {/* Contenedor Notificaciones */}
        <div className="relative" ref={notifRef}>
          <button 
            type="button" 
            title="Centro de Notificaciones"
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsModalOpen(false);
            }}
            className="p-2 rounded-xl text-slate-600 hover:text-[#0284c7] hover:bg-slate-100 transition-colors relative cursor-pointer flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {noLeidasCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold font-mono flex items-center justify-center shadow-xs animate-pulse">
                {noLeidasCount > 9 ? '9+' : noLeidasCount}
              </span>
            )}
          </button>

          {/* Menú Desplegable de Notificaciones */}
          {isNotifOpen && (
            <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              
              {/* Encabezado */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 font-space text-xs">Notificaciones</span>
                  {noLeidasCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold font-mono">
                      {noLeidasCount} nuevas
                    </span>
                  )}
                </div>
                {noLeidasCount > 0 && (
                  <button
                    onClick={marcarTodasLeidas}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold font-space cursor-pointer"
                    type="button"
                  >
                    Marcar todas leídas
                  </button>
                )}
              </div>

              {/* Lista de Notificaciones Recientes */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifLoading ? (
                  <div className="p-6 text-center text-xs text-slate-400 font-space">
                    <span className="material-symbols-outlined text-[24px] animate-spin text-blue-600 block mx-auto mb-1">
                      sync
                    </span>
                    Cargando notificaciones...
                  </div>
                ) : notificaciones.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 font-space space-y-1">
                    <span className="material-symbols-outlined text-[32px] text-slate-300 block mx-auto">
                      notifications_off
                    </span>
                    <p className="text-xs font-semibold text-slate-600">No tienes notificaciones</p>
                    <p className="text-[11px]">Las novedades del campus aparecerán aquí</p>
                  </div>
                ) : (
                  notificaciones.slice(0, 5).map((n) => {
                    const cfg = getNotifIconConfig(n.tipo);
                    const tiempo = formatRelativo(n.fecha_creacion);

                    return (
                      <div
                        key={n.id}
                        onClick={() => {
                          if (!n.leida) marcarLeida(n.id);
                          if (cfg.target) {
                            onNavigateTab(cfg.target);
                            setIsNotifOpen(false);
                          }
                        }}
                        className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 ${
                          !n.leida ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.color}`}>
                          <span className="material-symbols-outlined text-[18px]">{cfg.icon}</span>
                        </div>
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-xs font-bold text-slate-800 truncate font-space">
                              {n.titulo}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-mono shrink-0">
                              {tiempo}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                            {n.mensaje}
                          </p>
                        </div>
                        {!n.leida && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 self-center" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Pie con enlace al Centro de Notificaciones */}
              <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsNotifOpen(false);
                    onNavigateTab('notificaciones');
                  }}
                  className="w-full py-1.5 px-3 rounded-xl text-xs font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 font-space transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Ver todas en el Buzón</span>
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </button>
              </div>

            </div>
          )}
        </div>

        {/* Separador Vertical */}
        <div className="h-6 w-[1px] bg-slate-200/90 mx-1"></div>

        {/* Perfil interactivo */}
        <div className="relative" ref={modalRef}>
          <div 
            onClick={() => {
              setIsModalOpen(!isModalOpen);
              setIsNotifOpen(false);
            }}
            title="Ver perfil de usuario"
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-100 transition-all cursor-pointer select-none group"
          >
            {/* Avatar Azul con Iniciales */}
            <div className="w-9 h-9 rounded-full bg-[#0f52ba] text-white flex items-center justify-center font-bold text-xs font-space shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              {getInitials(displayName)}
            </div>

            {/* Nombre y Subtítulo en 2 Líneas */}
            <div className="flex flex-col justify-center text-left hidden sm:flex">
              <span className="text-xs font-bold text-slate-800 leading-tight font-space group-hover:text-[#0284c7] transition-colors">
                {displayName}
              </span>
              <span className="text-[11px] text-slate-500 leading-tight">
                {displaySubtitle}
              </span>
            </div>

            <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-slate-600 hidden sm:inline">
              {isModalOpen ? 'expand_less' : 'expand_more'}
            </span>
          </div>

          {/* MINI MODAL DE PERFIL DE USUARIO */}
          {isModalOpen && (
            <div className="absolute right-0 top-14 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              
              {/* Encabezado Verde / Azul Institucional con Avatar */}
              <div className="bg-[#0284c7] p-5 text-white text-center space-y-2 relative">
                <div className="w-16 h-16 mx-auto rounded-full bg-white/20 backdrop-blur-md border-2 border-white flex items-center justify-center text-white font-extrabold text-xl font-space shadow-inner">
                  {getInitials(displayName)}
                </div>
                <div>
                  <h3 className="text-base font-bold font-space leading-tight drop-shadow-xs">
                    {displayName}
                  </h3>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-semibold font-mono">
                    {currentRole}
                  </span>
                </div>
              </div>

              {/* Cuerpo de Información del Estudiante */}
              <div className="p-4 space-y-3 bg-slate-50 text-xs font-space border-b border-slate-200/80">
                <div className="flex flex-col">
                  <span className="text-slate-500 font-medium text-[11px]">{isFuncionario ? 'Código Funcionario:' : 'Código Estudiantil:'}</span>
                  <span className="text-slate-900 font-bold font-mono text-sm">{displayCodigo}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-slate-500 font-medium text-[11px]">{isFuncionario ? 'Dependencia / Unidad:' : 'Facultad:'}</span>
                  <span className="text-[#0284c7] font-semibold">{displayFacultad}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-slate-500 font-medium text-[11px]">Correo:</span>
                  <span className="text-slate-800 font-medium font-mono text-[11px] break-all">{displayEmail}</span>
                </div>
              </div>

              {/* Pie de Modal con Botones */}
              <div className="p-3 bg-white flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    onNavigateTab('perfil');
                  }}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-space font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-slate-500">settings</span>
                  <span>Mi Perfil</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    logout();
                  }}
                  className="flex-1 py-2 px-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 font-space font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  <span>Cerrar Sesión</span>
                </button>
              </div>

            </div>
          )}
        </div>

      </div>

    </header>
  );
};

export default Navbar;
