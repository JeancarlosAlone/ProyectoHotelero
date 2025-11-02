const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models');
const config = require('../config/jwt.config');
const Usuarios = db.usuarios;

module.exports = {
  async login({ id_users, password }) {
    const user = await Usuarios.findByPk(id_users);
    if (!user) throw new Error('Usuario no encontrado');

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new Error('Credenciales inválidas');

    const payload = {
      id_users: user.id_users,
      typeUser: user.typeUser,
      name: user.name
    };

    const token = jwt.sign(payload, config.secret, { expiresIn: config.expiresIn });

    // Devuelve datos mínimos + token
    return {
      usuario: {
        id_users: user.id_users,
        name: user.name,
        apellido: user.apellido,
        typeUser: user.typeUser
      },
      token
    };
  }
};
