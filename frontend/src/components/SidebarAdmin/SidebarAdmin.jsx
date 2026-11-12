import React from 'react';
import { useAuth } from '../../hooks/useAuth';

export const SidebarAdmin = ({
  activeTab = 'resumen',
  onTabChange = () => {},
  isCollapsed = false,
  counts = {},
  onTogglePortalEstudiante = () => {}
}) => {
  const { user } = useAuth();

  const menuItems = [
    { id: 'resumen', label: 'Panel de Control', icon: 'dashboard', badge: null },
    { id: 'usuarios', label: 'Gestión Usuarios', icon: 'manage_accounts', badge: counts.usuarios },
    { id: 'solicitudes', label: 'Solicitudes y Trámites', icon: 'fact_check', badge: counts.solicitudes },
    { id: 'pqrs', label: 'Atención de PQRS', icon: 'support_agent', badge: counts.pqrs },
    { id: 'recursos', label: 'Recursos del Campus', icon: 'devices_other', badge: counts.recursos },
    { id: 'reservas', label: 'Auditoría de Reservas', icon: 'calendar_month', badge: counts.reservas },
    { id: 'eventos', label: 'Eventos y Alertas', icon: 'campaign', badge: counts.eventos },
    { id: 'perfil', label: 'Mi Perfil Admin', icon: 'badge', badge: null },
  ];

  return (
    <aside
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-white border-r border-slate-200/90 h-[calc(100vh-4rem)] fixed top-16 left-0 hidden md:flex flex-col justify-between p-3 z-40 shadow-sm transition-all duration-300 ease-in-out select-none`}
    >
      {/* Sección Superior */}
      <div className="space-y-4">
        {/* Encabezado */}
        <div className="px-2 pt-1">
          {!isCollapsed ? (
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest font-space flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                ADMINISTRADOR
              </span>
              <span className="text-[9px] font-mono bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold px-1.5 py-0.5 rounded">
                CONTROL TOTAL
              </span>
            </div>
          ) : (
            <div className="flex justify-center mb-3">
              <span className="material-symbols-outlined text-[20px] text-indigo-600">admin_panel_settings</span>
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
                      ? 'bg-gradient-to-r from-indigo-50 to-blue-50 text-[#0a47b8] border border-blue-200/90 shadow-xs font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`material-symbols-outlined text-[20px] shrink-0 ${
                        isActive ? 'text-[#0a47b8]' : 'text-slate-400'
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
                          isActive ? 'bg-[#0a47b8] text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    ) : (
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#0a47b8] ring-2 ring-white" />
                    )
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Sección Inferior: Switcher a Portal Estudiante */}
      <div className="pt-3 border-t border-slate-200/80 space-y-2">
        <button
          onClick={onTogglePortalEstudiante}
          title={isCollapsed ? 'Ver Portal Estudiante' : ''}
          type="button"
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2'
          } rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold font-space transition-all cursor-pointer`}
        >
          <span className="material-symbols-outlined text-[18px] text-slate-500">visibility</span>
          {!isCollapsed && <span className="truncate">Vista Estudiante</span>}
        </button>

        {!isCollapsed && (
          <div className="px-2 text-[10px] text-slate-400 font-mono text-center">
            UAJS Smart Campus • v2.0
          </div>
        )}
      </div>
    </aside>
  );
};

export default SidebarAdmin;

