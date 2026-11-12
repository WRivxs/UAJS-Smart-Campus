import React, { useState, useMemo } from 'react';
import useAdminUsuarios from '../../hooks/useAdminUsuarios';

export const AdminUsuarios = () => {
  const {
    usuarios,
    roles,
    loading,
    actionLoading,
    refetch,
    actualizarUsuario,
    toggleEstadoUsuario,
    eliminarUsuario,
  } = useAdminUsuarios();

  const [busqueda, setBusqueda] = useState('');
  const [rolFiltro, setRolFiltro] = useState('TODOS');
  const [estadoFiltro, setEstadoFiltro] = useState('TODOS');

  // Modales
  const [usuarioDetalle, setUsuarioDetalle] = useState(null);
  const [usuarioAEditar, setUsuarioAEditar] = useState(null);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (type, title, desc) => {
    setToast({ type, title, desc });
    setTimeout(() => setToast(null), 3500);
  };

  // Filtrado de usuarios
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((u) => {
      const matchRol = rolFiltro === 'TODOS' || u.rol_nombre === rolFiltro;
      const matchEstado = estadoFiltro === 'TODOS' || u.estado === estadoFiltro;
      const q = busqueda.toLowerCase().trim();
      const matchBusqueda =
        !q ||
        (u.nombre || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.codigo_estudiantil || '').toLowerCase().includes(q) ||
        (u.facultad_departamento || '').toLowerCase().includes(q);

      return matchRol && matchEstado && matchBusqueda;
    });
  }, [usuarios, rolFiltro, estadoFiltro, busqueda]);

  // Manejo de edición
  const handleGuardarEdicion = async (e) => {
    e.preventDefault();
    if (!usuarioAEditar) return;

    const res = await actualizarUsuario(usuarioAEditar.id, {
      nombre: usuarioAEditar.nombre,
      rol_id: parseInt(usuarioAEditar.rol_id, 10),
      facultad_departamento: usuarioAEditar.facultad_departamento,
      estado: usuarioAEditar.estado,
      celular: usuarioAEditar.celular,
      email_personal: usuarioAEditar.email_personal,
    });

    if (res.ok) {
      showToast('success', 'Usuario Actualizado', res.message);
      setUsuarioAEditar(null);
    } else {
      showToast('error', 'Error al Actualizar', res.message);
    }
  };

  // Manejo de eliminación
  const handleConfirmarEliminar = async () => {
    if (!usuarioAEliminar) return;
    const res = await eliminarUsuario(usuarioAEliminar.id);
    if (res.ok) {
      showToast('info', 'Usuario Eliminado', res.message);
      setUsuarioAEliminar(null);
    } else {
      showToast('error', 'Error al Eliminar', res.message);
    }
  };

  const getRolBadgeColor = (rolNombre) => {
    switch (rolNombre) {
      case 'Administrador':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Docente':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Administrativo':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-sky-50 text-sky-700 border-sky-200';
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden text-slate-800">
      
      {/* Toast Flotante */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 flex items-start gap-3 p-4 rounded-xl shadow-xl border text-xs max-w-sm animate-in slide-in-from-top-4 duration-200 ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' :
          toast.type === 'error' ? 'bg-rose-50 border-rose-300 text-rose-900' :
          'bg-blue-50 border-blue-300 text-blue-900'
        }`}>
          <span className="material-symbols-outlined text-[20px] shrink-0">
            {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info'}
          </span>
          <div>
            <h4 className="font-bold font-space">{toast.title}</h4>
            <p className="mt-0.5 leading-relaxed">{toast.desc}</p>
          </div>
        </div>
      )}

      {/* ── Banner Institucional de la Sección ────────────────────────── */}
      <div className="bg-gradient-to-r from-[#081f56] via-[#0a47b8] to-blue-600 rounded-xl p-6 text-white relative overflow-hidden shadow-xl">
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[10px] font-space font-semibold uppercase tracking-wider text-blue-100">
            <span className="material-symbols-outlined text-[14px]">manage_accounts</span>
            <span>Microservicio ms-usuarios (:3001) • PostgreSQL db_usuarios</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-space text-white">
            Administración y Gobernanza de Usuarios
          </h1>
          <p className="text-xs text-blue-100/90 max-w-2xl">
            Control de cuentas, roles institucionales (RBAC), perfiles estudiantiles y docentes con auditoría de estados.
          </p>
        </div>
      </div>

      {/* ── Barra de Filtros y Búsqueda ───────────────────────────────── */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Buscador */}
          <div className="relative flex-1 w-full">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, correo, código o facultad..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0a47b8] transition-all"
            />
            {busqueda && (
              <button onClick={() => setBusqueda('')} type="button" className="absolute right-2.5 top-2.5 text-slate-400">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Filtro por Rol */}
          <div className="w-full sm:w-48 shrink-0">
            <select
              value={rolFiltro}
              onChange={(e) => setRolFiltro(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-space cursor-pointer"
            >
              <option value="TODOS">Todos los roles</option>
              <option value="Estudiante">Estudiantes</option>
              <option value="Docente">Docentes</option>
              <option value="Administrativo">Administrativos</option>
              <option value="Administrador">Administradores</option>
            </select>
          </div>

          {/* Filtro por Estado */}
          <div className="w-full sm:w-40 shrink-0">
            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-space cursor-pointer"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>

          <button
            onClick={() => refetch()}
            disabled={loading}
            type="button"
            className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold font-space flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span className={`material-symbols-outlined text-[16px] ${loading ? 'animate-spin text-blue-600' : ''}`}>
              refresh
            </span>
            <span>Recargar</span>
          </button>
        </div>
      </div>

      {/* ── Tabla de Usuarios ─────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-3 border-[#0a47b8] border-t-transparent" />
            <p className="text-xs text-slate-500 font-space font-medium">Consultando usuarios en db_usuarios...</p>
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <span className="material-symbols-outlined text-slate-300 text-[40px]">person_off</span>
            <p className="text-sm font-bold text-slate-700 font-space">No se encontraron usuarios</p>
            <p className="text-xs text-slate-500">Prueba ajustando los filtros o términos de búsqueda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-space uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5 pl-4">Usuario / Nombre</th>
                  <th className="p-3.5">Correo Institucional</th>
                  <th className="p-3.5">Rol</th>
                  <th className="p-3.5">Facultad / Dpto</th>
                  <th className="p-3.5 text-center">Estado</th>
                  <th className="p-3.5 text-right pr-4">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usuariosFiltrados.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 pl-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-[#0a47b8] font-bold flex items-center justify-center text-xs shrink-0 font-space">
                          {u.nombre ? u.nombre.substring(0, 2).toUpperCase() : 'UA'}
                        </div>
                        <div>
                          <span className="font-bold font-space text-slate-900 block">{u.nombre}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {u.codigo_estudiantil ? `Cód: ${u.codigo_estudiantil}` : `ID: #${u.id}`}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-600">
                      {u.email}
                    </td>
                    <td className="p-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold font-space border ${getRolBadgeColor(u.rol_nombre)}`}>
                        {u.rol_nombre || 'Estudiante'}
                      </span>
                    </td>
                    <td className="p-3.5 text-[11px] text-slate-600 truncate max-w-[200px]">
                      {u.facultad_departamento || u.facultad || 'Sin asignar'}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => toggleEstadoUsuario(u)}
                        disabled={actionLoading}
                        title="Clic para cambiar estado activo/inactivo"
                        type="button"
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                          u.estado === 'activo'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${u.estado === 'activo' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span>{u.estado === 'activo' ? 'Activo' : 'Inactivo'}</span>
                      </button>
                    </td>
                    <td className="p-3.5 text-right pr-4 space-x-1">
                      <button
                        onClick={() => setUsuarioDetalle(u)}
                        title="Ver Perfil Completo"
                        type="button"
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-[#0a47b8] transition-colors"
                      >
                        <span className="material-symbols-outlined text-[17px]">visibility</span>
                      </button>
                      <button
                        onClick={() => setUsuarioAEditar({ ...u })}
                        title="Editar Usuario"
                        type="button"
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[17px]">edit</span>
                      </button>
                      <button
                        onClick={() => setUsuarioAEliminar(u)}
                        title="Eliminar Usuario"
                        type="button"
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[17px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal Ver Perfil Detallado ─────────────────────────────────── */}
      {usuarioDetalle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setUsuarioDetalle(null)}
        >
          <div
            className="bg-white rounded-xl border border-slate-200 max-w-lg w-full shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-[#081f56] to-blue-700 p-5 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold font-space uppercase tracking-widest text-blue-200">
                  Ficha Institucional • ms-usuarios
                </span>
                <h3 className="text-base font-bold font-space text-white">{usuarioDetalle.nombre}</h3>
              </div>
              <button onClick={() => setUsuarioDetalle(null)} type="button" className="text-white/80 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">Rol</span>
                  <span className="font-bold text-slate-800">{usuarioDetalle.rol_nombre}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Estado</span>
                  <span className="font-bold text-slate-800 capitalize">{usuarioDetalle.estado}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Documento</span>
                  <span className="font-bold text-slate-800">{usuarioDetalle.tipo_documento || 'CC'} {usuarioDetalle.numero_documento || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Fecha Nacimiento / Edad</span>
                  <span className="font-bold text-slate-800">{usuarioDetalle.fecha_nacimiento || '—'} {usuarioDetalle.edad ? `(${usuarioDetalle.edad} años)` : ''}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Correo Institucional:</span>
                  <span className="font-mono font-bold text-slate-800">{usuarioDetalle.email}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Correo Personal:</span>
                  <span className="font-mono text-slate-700">{usuarioDetalle.email_personal || '—'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Celular / Teléfono:</span>
                  <span className="font-mono text-slate-700">{usuarioDetalle.celular || usuarioDetalle.telefono || '—'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Facultad / Programa:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[250px]">{usuarioDetalle.facultad_departamento || usuarioDetalle.programa_academico || '—'}</span>
                </div>
                {usuarioDetalle.semestre_actual && (
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">Semestre Actual:</span>
                    <span className="font-bold text-blue-700">{usuarioDetalle.semestre_actual}° Semestre</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setUsuarioDetalle(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs font-space cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Editar Usuario ───────────────────────────────────────── */}
      {usuarioAEditar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => !actionLoading && setUsuarioAEditar(null)}
        >
          <div
            className="bg-white rounded-xl border border-slate-200 max-w-lg w-full shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-[#081f56] to-blue-700 p-5 text-white flex items-center justify-between">
              <h3 className="text-base font-bold font-space text-white">Editar Usuario</h3>
              <button onClick={() => setUsuarioAEditar(null)} disabled={actionLoading} type="button" className="text-white/80 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleGuardarEdicion} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase font-space mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={usuarioAEditar.nombre}
                  onChange={(e) => setUsuarioAEditar({ ...usuarioAEditar, nombre: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0a47b8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase font-space mb-1">Rol Institucional</label>
                  <select
                    value={usuarioAEditar.rol_id}
                    onChange={(e) => setUsuarioAEditar({ ...usuarioAEditar, rol_id: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>{r.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase font-space mb-1">Estado</label>
                  <select
                    value={usuarioAEditar.estado}
                    onChange={(e) => setUsuarioAEditar({ ...usuarioAEditar, estado: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase font-space mb-1">Facultad / Departamento</label>
                <input
                  type="text"
                  value={usuarioAEditar.facultad_departamento || ''}
                  onChange={(e) => setUsuarioAEditar({ ...usuarioAEditar, facultad_departamento: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase font-space mb-1">Celular</label>
                  <input
                    type="text"
                    value={usuarioAEditar.celular || ''}
                    onChange={(e) => setUsuarioAEditar({ ...usuarioAEditar, celular: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase font-space mb-1">Email Personal</label>
                  <input
                    type="email"
                    value={usuarioAEditar.email_personal || ''}
                    onChange={(e) => setUsuarioAEditar({ ...usuarioAEditar, email_personal: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUsuarioAEditar(null)}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold font-space cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-[#0a47b8] text-white text-xs font-bold font-space hover:bg-[#081f56] transition-all cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Guardando en BD...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Confirmar Eliminar Usuario ───────────────────────────── */}
      {usuarioAEliminar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => !actionLoading && setUsuarioAEliminar(null)}
        >
          <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[28px]">warning</span>
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold font-space text-slate-900">¿Eliminar usuario?</h3>
              <p className="text-xs text-slate-600">
                Se eliminará la cuenta de <strong className="text-slate-900">{usuarioAEliminar.nombre}</strong> ({usuarioAEliminar.email}) de PostgreSQL db_usuarios.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUsuarioAEliminar(null)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold font-space"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarEliminar}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold font-space disabled:opacity-50"
              >
                {actionLoading ? 'Eliminando...' : 'Sí, Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminUsuarios;
