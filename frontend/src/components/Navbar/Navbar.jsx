import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import useProfile from '../../hooks/useProfile';

export const Navbar = ({ title = "Smart Campus", onToggleSidebar }) => {
  const { user, logout, rol } = useAuth();
  const { profile } = useProfile();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef(null);

  const currentRole = rol || profile?.rol_nombre || user?.rol_nombre || 'Estudiante';
  const displayName = profile?.nombre || user?.nombre || 'Laura Paternina';
  const displayEmail = profile?.email || user?.email || 'estudiante@uajs.edu.co';
  const displayCodigo = profile?.codigo_estudiantil || 'EST-2026-8841';
  const displayFacultad = profile?.facultad || 'Ingeniería de Sistemas';

  const displaySubtitle = currentRole === 'Estudiante' 
    ? 'Estudiante de Ingeniería' 
    : `${currentRole} Institucional`;

  // Helper para obtener iniciales (ej: Laura Paternina -> LP)
  const getInitials = (name) => {
    if (!name) return 'UA';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Cerrar el modal al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsModalOpen(false);
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

      {/* Derecha: Iconos de Utilidad + Perfil interactivo */}
      <div className="flex items-center gap-3 md:gap-4 relative" ref={modalRef}>
        
        {/* Icono Notificaciones */}
        <button 
          type="button" 
          title="Notificaciones"
          className="p-1.5 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#0284c7]"></span>
        </button>

        {/* Separador Vertical */}
        <div className="h-6 w-[1px] bg-slate-200/90 mx-1"></div>

        {/* 4. Trigger interactivo para abrir el Mini Modal de Perfil */}
        <div 
          onClick={() => setIsModalOpen(!isModalOpen)}
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

        {/* 5. MINI MODAL DE PERFIL DE USUARIO */}
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
                <span className="text-slate-500 font-medium text-[11px]">Código Estudiantil:</span>
                <span className="text-slate-900 font-bold font-mono text-sm">{displayCodigo}</span>
              </div>

              <div className="flex flex-col">
                <span className="text-slate-500 font-medium text-[11px]">Facultad:</span>
                <span className="text-[#0284c7] font-semibold">{displayFacultad}</span>
              </div>

              <div className="flex flex-col">
                <span className="text-slate-500 font-medium text-[11px]">Correo:</span>
                <span className="text-slate-800 font-medium font-mono text-[11px] break-all">{displayEmail}</span>
              </div>

            </div>

            {/* Pie de Modal con Botones en Español */}
            <div className="p-3 bg-white flex items-center justify-between gap-3">
              
              {/* Botón Mi Perfil */}
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  alert(`Mi Perfil de ${displayName}`);
                }}
                className="flex-1 py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-space font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-slate-500">settings</span>
                <span>Mi Perfil</span>
              </button>

              {/* Botón Cerrar Sesión */}
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

    </header>
  );
};

export default Navbar;
