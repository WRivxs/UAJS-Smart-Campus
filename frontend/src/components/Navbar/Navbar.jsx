import React from 'react';
import './Navbar.css';

export const Navbar = () => {
  return (
    <header className="navbar">
      <div className="navbar__brand">🎓 UAJS Smart Campus</div>
      <div className="navbar__user">Perfil & Notificaciones</div>
    </header>
  );
};

export default Navbar;
