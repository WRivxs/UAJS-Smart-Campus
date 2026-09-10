import React from 'react';

export const ResourceModal = ({ isOpen, onClose, recurso }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Reserva de Recurso: {recurso?.nombre}</h2>
        <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
};

export default ResourceModal;
