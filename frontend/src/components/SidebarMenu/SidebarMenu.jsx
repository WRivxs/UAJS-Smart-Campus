import React from 'react';
import './SidebarMenu.css';

export const SidebarMenu = ({ rol }) => {
  return (
    <aside className="sidebar-menu">
      <nav className="sidebar-menu__nav">
        <ul>
          <li>Dashboard ({rol})</li>
          <li>Servicios</li>
          <li>Solicitudes</li>
        </ul>
      </nav>
    </aside>
  );
};

export default SidebarMenu;
