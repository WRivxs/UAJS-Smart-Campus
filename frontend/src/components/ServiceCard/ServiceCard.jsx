import React from 'react';
import './ServiceCard.css';

export const ServiceCard = ({ servicio }) => {
  return (
    <div className="service-card">
      <h3 className="service-card__title">{servicio?.nombre || 'Servicio Universitario'}</h3>
      <p className="service-card__desc">{servicio?.descripcion || 'Descripción del servicio'}</p>
    </div>
  );
};

export default ServiceCard;
