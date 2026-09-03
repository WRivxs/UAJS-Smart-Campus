const db = require('../config/db');

const UserModel = {
  findByEmail: async (email) => {
    const query = `
      SELECT u.*, r.nombre AS rol_nombre, r.descripcion AS rol_descripcion
      FROM usuarios u
      JOIN roles r ON u.rol_id = r.id
      WHERE u.email = $1;
    `;
    const { rows } = await db.query(query, [email]);
    return rows[0];
  },

  findById: async (id) => {
    const query = `
      SELECT u.id, u.nombre, u.email, u.rol_id, r.nombre AS rol_nombre, 
             u.facultad_departamento, u.codigo_estudiantil, u.estado, u.creado_en
      FROM usuarios u
      JOIN roles r ON u.rol_id = r.id
      WHERE u.id = $1;
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  },

  createUser: async ({ nombre, email, password_hash, rol_id, facultad_departamento, codigo_estudiantil }) => {
    const query = `
      INSERT INTO usuarios (nombre, email, password_hash, rol_id, facultad_departamento, codigo_estudiantil)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, nombre, email, rol_id, facultad_departamento, codigo_estudiantil, creado_en;
    `;
    const values = [nombre, email, password_hash, rol_id, facultad_departamento, codigo_estudiantil];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  findAll: async () => {
    const query = `
      SELECT u.id, u.nombre, u.email, u.rol_id, r.nombre AS rol_nombre, 
             u.facultad_departamento, u.codigo_estudiantil, u.estado, u.creado_en
      FROM usuarios u
      JOIN roles r ON u.rol_id = r.id
      ORDER BY u.id ASC;
    `;
    const { rows } = await db.query(query);
    return rows;
  },

  update: async (id, { nombre, email, rol_id, facultad_departamento, estado }) => {
    const query = `
      UPDATE usuarios
      SET nombre = COALESCE($1, nombre),
          email = COALESCE($2, email),
          rol_id = COALESCE($3, rol_id),
          facultad_departamento = COALESCE($4, facultad_departamento),
          estado = COALESCE($5, estado)
      WHERE id = $6
      RETURNING id, nombre, email, rol_id, facultad_departamento, estado;
    `;
    const { rows } = await db.query(query, [nombre, email, rol_id, facultad_departamento, estado, id]);
    return rows[0];
  },

  delete: async (id) => {
    const query = `DELETE FROM usuarios WHERE id = $1 RETURNING id;`;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  },

  findAllRoles: async () => {
    const query = `SELECT * FROM roles ORDER BY id ASC;`;
    const { rows } = await db.query(query);
    return rows;
  },

  findRolByName: async (nombre) => {
    const query = `SELECT * FROM roles WHERE nombre = $1;`;
    const { rows } = await db.query(query, [nombre]);
    return rows[0];
  }
};

module.exports = UserModel;
