// app/services/usuarios.service.js
const db = require('../models');
const Usuarios = db.usuarios;

/**
 * Genera ID: 1ra letra del primer nombre + 1ra letra del primer apellido + número 0000–0999
 * (ej. Jeancarlo Lopez -> JL0005)
 */
async function generateUniqueId(nombre, apellido) {
  const firstLetterNombre = (nombre?.trim()?.[0] || '').toUpperCase();
  const firstLetterApellido = (apellido?.trim()?.[0] || '').toUpperCase();

  if (!firstLetterNombre || !firstLetterApellido) {
    throw new Error('Nombre y apellido requeridos para generar id_users');
  }

  let id, exists = true;

  while (exists) {
    const num = Math.floor(Math.random() * 1000); // 0..999
    const num4 = String(num).padStart(4, '0');    // "0005"
    id = `${firstLetterNombre}${firstLetterApellido}${num4}`;
    const found = await Usuarios.findByPk(id);
    exists = !!found;
  }
  return id;
}

module.exports = {
  // GET all
  async getAllUsers() {
    return Usuarios.findAll();
  },

  // GET by id
  async getUsersById(id) {
    return Usuarios.findByPk(id); // devuelve null si no existe (equiv. Optional)
  },

  // POST save (genera id_users)
  async saveUser(user) {
    const generatedId = await generateUniqueId(user.name, user.apellido);
    user.id_users = generatedId;
    
    return Usuarios.create(user);
  },

  // PUT update
  async updateUser(id, user) {
    const exists = await Usuarios.findByPk(id);
    if (!exists) throw new Error('Usuario no encontrado');

    
    const payload = {
      name: user.name,
      apellido: user.apellido,
      password: user.password,
      typeUser: 'user',
    };

    await Usuarios.update(payload, { where: { id_users: id } });
    return Usuarios.findByPk(id);
  },

  // DELETE
  async deleteUser(id) {
    await Usuarios.destroy({ where: { id_users: id } });
  },

  // existsById
  async existeUsuario(id) {
    const found = await Usuarios.findByPk(id);
    return !!found;
  },
};
