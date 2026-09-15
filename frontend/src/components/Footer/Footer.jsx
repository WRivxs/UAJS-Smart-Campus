import React from 'react'; 
export const Footer = () => { 
  return ( 
    <footer className="w-full py-4 px-6 md:px-12 flex flex-col md:flex
row justify-between items-center gap-3 bg-white backdrop-blur-md 
border-t border-[#3c494e]/20 z-40"> 
       
      {/* Insignia de Prototipo y Copyright */} 
      <div className="flex flex-wrap items-center gap-3"> 
        <span className="text-[10px] text-[#00d2ff] bg-[#00d2ff]/10 px-2 
py-0.5 rounded border border-[#00d2ff]/20 font-space font-semibold"> 
          Prototipo académico · Datos ficticios 
        </span> 
        <span className="text-xs text-[#bbc9cf]"> 
          © Corporación Universitaria Antonio José de Sucre • Todos los 
derechos reservados 
        </span> 
      </div> 
      
      {/* Enlaces de Navegación e Información Institucional */} 
      <div className="flex flex-wrap items-center justify-center gap-4 
text-xs text-[#bbc9cf]"> 
        <a href="#privacidad" className="hover:text-[#47d6ff] transition
colors"> 
          Políticas de Privacidad 
        </a> 
        <a href="#soporte-it" className="hover:text-[#47d6ff] transition
colors"> 
          Soporte IT & Directorio Activo 
        </a> 
        <a href="#terminos" className="hover:text-[#47d6ff] transition
colors"> 
          Términos de Servicio 
        </a> 
        <a href="#seguridad" className="hover:text-[#47d6ff] transition
colors"> 
          Seguridad Informática 
        </a> 
      </div> 
    </footer> 
  ); 
}; 
export default Footer;