import React from 'react';

/**
 * DataTable - Componente de tabla reutilizable y profesional para UNiAJS Smart Campus
 * 
 * @param {Array} columns - Lista de columnas: [{ key, label, render: (row, idx) => JSX, align: 'left'|'center'|'right' }]
 * @param {Array} data - Lista de objetos de datos a renderizar
 * @param {String|JSX} emptyMessage - Mensaje para estado sin registros
 * @param {String|JSX} emptyIcon - Ícono Material Symbol para estado vacío
 * @param {Boolean} loading - Indicador de carga
 */
export const DataTable = ({
  columns = [],
  data = [],
  emptyMessage = 'No hay registros cargados en esta vista.',
  emptyIcon = 'inbox',
  loading = false,
  className = ''
}) => {
  return (
    <div className={`w-full overflow-hidden bg-white border border-slate-200/90 rounded-2xl shadow-sm ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200/90">
              {columns.map((col, idx) => {
                const label = typeof col === 'string' ? col : col.label;
                const align = typeof col === 'object' && col.align ? `text-${col.align}` : 'text-left';
                return (
                  <th
                    key={idx}
                    className={`py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-space ${align}`}
                  >
                    {label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {loading ? (
              <tr>
                <td colSpan={columns.length || 1} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[32px] animate-spin text-[#0a47b8]">progress_activity</span>
                    <span className="font-medium text-xs">Cargando registros institucionales...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length || 1} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                      <span className="material-symbols-outlined text-[24px]">{emptyIcon}</span>
                    </div>
                    <p className="font-bold text-slate-700 text-sm">{emptyMessage}</p>
                    <p className="text-[11px] text-slate-400">La información se sincroniza en tiempo real con las bases de datos de UNiAJS.</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={row.id || rowIdx}
                  className="hover:bg-blue-50/40 transition-colors duration-150 group"
                >
                  {columns.map((col, colIdx) => {
                    const key = typeof col === 'string' ? col : col.key;
                    const renderFn = typeof col === 'object' && col.render ? col.render : null;
                    const align = typeof col === 'object' && col.align ? `text-${col.align}` : 'text-left';

                    return (
                      <td key={colIdx} className={`py-3.5 px-4 align-middle ${align}`}>
                        {renderFn ? renderFn(row, rowIdx) : row[key] !== undefined ? String(row[key]) : '—'}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
