import React from 'react';

export const DataTable = ({ columns = [], data = [] }) => {
  return (
    <table className="data-table">
      <thead>
        <tr>
          {columns.map((col, idx) => <th key={idx}>{col}</th>)}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr><td colSpan={columns.length || 1}>No hay registros cargados.</td></tr>
        ) : (
          data.map((row, idx) => <tr key={idx}><td>{JSON.stringify(row)}</td></tr>)
        )}
      </tbody>
    </table>
  );
};

export default DataTable;
