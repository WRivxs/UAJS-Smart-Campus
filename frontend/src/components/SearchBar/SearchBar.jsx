import React from 'react';
import './SearchBar.css';

export const SearchBar = ({ onSearch }) => {
  return (
    <div className="search-bar">
      <input type="text" placeholder="Buscar trámites, recursos o eventos..." className="search-bar__input" />
    </div>
  );
};

export default SearchBar;
