import React from 'react';

export const EventCard = ({ evento }) => {
  return (
    <div className="event-card">
      <h3>{evento?.titulo || 'Evento Universitario'}</h3>
      <p>{evento?.descripcion || 'Descripción del evento'}</p>
    </div>
  );
};

export default EventCard;
