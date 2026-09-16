import React from 'react';

export const Footer = () => {
  return (
    <footer className="w-full py-4 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-3 bg-white border-t border-slate-200/90 text-slate-500 font-space text-xs z-40">
      
      {/* Insignia de Prototipo y Copyright */}
      <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
        <span className="text-[10px] text-[#0284c7] bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200 font-semibold">
          Prototipo académico · Datos ficticios
        </span>
        <span className="text-slate-600">
          © Corporación Universitaria Antonio José de Sucre • Todos los derechos reservados
        </span>
      </div>
      
      {/* Enlaces de Navegación e Información Institucional */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-slate-500 text-xs">
        <a href="#privacidad" className="hover:text-[#0284c7] transition-colors">
          Políticas de Privacidad
        </a>
        <a href="#soporte-it" className="hover:text-[#0284c7] transition-colors">
          Soporte IT & Directorio Activo
        </a>
        <a href="#terminos" className="hover:text-[#47d6ff] hover:text-[#0284c7] transition-colors">
          Términos de Servicio
        </a>
        <a href="#seguridad" className="hover:text-[#0284c7] transition-colors">
          Seguridad Informática
        </a>
      </div>

    </footer>
  );
};

export default Footer;