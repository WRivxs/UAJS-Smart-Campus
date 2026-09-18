import React from 'react';
import { useAuth } from '../../hooks/useAuth';

export const SidebarMenu = ({
  activeTab = 'inicio',
  onTabChange = () => {},
  isCollapsed = false,
  counts = { eventos: 4, solicitudes: 4, reservas: 2, pqrs: 1 }
}) => {
  const { user, rol } = useAuth();

  // Opciones de menú según la Matriz de Roles
  const menuItems = [
    { id: 'inicio', label: 'Inicio', icon: 'home' },
    { id: 'notas', label: 'Notas & Materias', icon: 'school' },
    { id: 'solicitudes', label: 'Mis Solicitudes', icon: 'description', badge: counts.solicitudes },
    { id: 'pqrs', label: 'Mis PQRS', icon: 'support_agent', badge: counts.pqrs },
    { id: 'reservas', label: 'Mis Reservas', icon: 'calendar_month', badge: counts.reservas },
    { id: 'eventos', label: 'Eventos Campus', icon: 'event', badge: counts.eventos },
    { id: 'perfil', label: 'Mi Perfil', icon: 'person' }
  ];

  return (
    <aside
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-white border-r border-slate-200/90 h-[calc(100vh-4rem)] fixed top-16 left-0 hidden md:flex flex-col justify-between p-3 z-40 shadow-sm transition-all duration-300 ease-in-out select-none`}
    >
      
      {/* Sección Superior: Navegación */}
      <div className="space-y-4">

        {/* Encabezado del Menú */}
        <div className="px-2 pt-1">
          {!isCollapsed ? (
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-space">
              MENÚ CAMPUS
            </span>
          ) : (
            <div className="flex justify-center">
              <span className="material-symbols-outlined text-[18px] text-slate-300">grid_view</span>
            </div>
          )}
          <nav className="mt-3 space-y-1">
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
                      ? 'bg-cyan-50 text-[#0284c7] border border-cyan-200/80 shadow-xs font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`material-symbols-outlined text-[20px] shrink-0 ${
                        isActive ? 'text-[#0284c7]' : 'text-slate-400'
                      }`}
                    >
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </div>

                  {/* Badges de Microservicios */}
                  {hasBadge && (
                    !isCollapsed ? (
                      <span
                        className={`px-2 py-0.5 text-[10px] rounded-full font-bold font-mono transition-colors ${
                          isActive
                            ? 'bg-[#0284c7] text-white'
                            : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                        }`}
                      >
                        {item.badge}
                      </span>
                    ) : (
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#0284c7] ring-2 ring-white" />
                    )
                  )}
                </button>
              );
            })}
          </nav>
        </div>

      </div>

      {/* Pie de Menú sin Pase Digital (Respetando indicación del usuario) */}
      <div className={`pt-3 border-t border-slate-200/80 text-[11px] text-slate-500 font-mono ${
        isCollapsed ? 'flex flex-col items-center gap-1 text-[10px]' : 'flex items-center justify-between'
      }`}>
        <span>{isCollapsed ? 'v2.0' : 'UAJS v2.0'}</span>
        <span className="text-emerald-600 font-bold flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {!isCollapsed && 'Online'}
        </span>
      </div>

    </aside>
  );
};

export default SidebarMenu;
