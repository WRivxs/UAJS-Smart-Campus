import React from 'react';
import { useAuth } from '../../hooks/useAuth';

export const SidebarMenu = ({ activeTab = 'inicio', onTabChange = () => {} }) => {
  const { user, rol } = useAuth();
  const currentRole = rol || user?.rol_nombre || 'Estudiante';

  // Navigation Items according to Matriz de Roles (matriz_de_roles.md)
  const menuItems = [
    { id: 'inicio', label: 'Inicio', icon: 'home' },
    { id: 'notas', label: 'Notas & Materias', icon: 'school' },
    { id: 'solicitudes', label: 'Mis Solicitudes', icon: 'description' },
    { id: 'pqrs', label: 'Mis PQRS', icon: 'support_agent' },
    { id: 'reservas', label: 'Mis Reservas', icon: 'calendar_month' },
    { id: 'eventos', label: 'Eventos Campus', icon: 'event' },
    { id: 'perfil', label: 'Mi Perfil', icon: 'person' }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 h-[calc(100vh-4rem)] fixed top-16 left-0 hidden md:flex flex-col justify-between p-4 z-40 shadow-sm">
      
      {/* Navigation Links */}
      <div className="space-y-6">

        {/* Section Header */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-space px-2">
            MENÚ CAMPUS
          </span>
          <nav className="mt-2 space-y-1">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold font-space transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-cyan-50 text-[#0284c7] border border-cyan-200/80 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-[#0284c7]' : 'text-slate-400'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

      </div>

      {/* Footer Meta / Support Badge */}
      <div className="pt-3 border-t border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between font-mono">
        <span>UAJS v2.0</span>
        <span className="text-emerald-600 font-bold">● Online</span>
      </div>

    </aside>
  );
};

export default SidebarMenu;
