import React from 'react';
import { useAuth } from '../../hooks/useAuth';

export const SidebarDocente = ({
  activeTab = 'inicio',
  onTabChange = () => {},
  isCollapsed = false,
  counts = {},
}) => {
  const { user } = useAuth();

  const menuItems = [
    { id: 'inicio',          label: 'Inicio Académico',      icon: 'school',          badge: null },
    { id: 'solicitudes',     label: 'Mis Solicitudes',        icon: 'fact_check',      badge: counts.solicitudes },
    { id: 'reservas',        label: 'Mis Reservas',           icon: 'calendar_month',  badge: counts.reservas },
    { id: 'mis-eventos',     label: 'Mis Eventos',            icon: 'event_available', badge: counts.misEventos },
    { id: 'eventos',         label: 'Agenda del Campus',      icon: 'campaign',        badge: null },
    { id: 'pqrs',            label: 'Mis PQRS',               icon: 'support_agent',   badge: counts.pqrs },
    { id: 'notificaciones',  label: 'Notificaciones',         icon: 'notifications',   badge: counts.notificaciones },
    { id: 'perfil',          label: 'Mi Perfil Docente',      icon: 'badge',           badge: null },
  ];

  return (
    <aside
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-white border-r border-slate-200/90 h-[calc(100vh-4rem)] fixed top-16 left-0 hidden md:flex flex-col justify-between p-3 z-40 shadow-sm transition-all duration-300 ease-in-out select-none`}
    >
      {/* Sección Superior */}
      <div className="space-y-4">
        <div className="px-2 pt-1">
          {!isCollapsed ? (
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-violet-700 uppercase tracking-widest font-space flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-violet-600 animate-pulse" />
                DOCENTE
              </span>
              <span className="text-[9px] font-mono bg-violet-50 border-violet-200 text-violet-700 border font-bold px-1.5 py-0.5 rounded">
                PORTAL ACADÉMICO
              </span>
            </div>
          ) : (
            <div className="flex justify-center mb-3">
              <span className="material-symbols-outlined text-[20px] text-violet-600">school</span>
            </div>
          )}

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              const hasBadge = item.badge !== undefined && item.badge > 0;

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  title={isCollapsed ? `${item.label}${hasBadge ? ` (${item.badge})` : ''}` : ''}
                  className={`w-full relative flex items-center ${
                    isCollapsed ? 'justify-center p-3' : 'justify-between px-3 py-2.5'
                  } rounded-xl text-xs font-semibold font-space transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-50 to-indigo-50 text-violet-700 border border-violet-200/90 shadow-xs font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`material-symbols-outlined text-[20px] shrink-0 ${
                        isActive ? 'text-violet-600' : 'text-slate-400'
                      }`}
                    >
                      {item.icon}
                    </span>
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {hasBadge && (
                    !isCollapsed ? (
                      <span
                        className={`px-2 py-0.5 text-[10px] rounded-full font-bold font-mono ${
                          isActive ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    ) : (
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-violet-600 ring-2 ring-white" />
                    )
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Sección Inferior */}
      <div className="pt-3 border-t border-slate-200/80 space-y-2">
        {!isCollapsed && (
          <div className="px-2 text-[10px] text-slate-400 font-mono text-center">
            UAJS Smart Campus • v2.0
          </div>
        )}
      </div>
    </aside>
  );
};

export default SidebarDocente;

