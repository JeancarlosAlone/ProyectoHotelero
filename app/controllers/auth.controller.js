const db = require("../models");
const Usuarios = db.usuarios;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const jwtConfig = require("../config/jwt.config");
const ApiResponse = require("../utils/apiResponse");

exports.login = async (req, res) => {
  try {
    const { name, correo, password } = req.body;

    if (!name && !correo) {
      return res.status(400).json({ message: "Debes enviar 'name' o 'correo'" });
    }
    if (!password) {
      return res.status(400).json({ message: "Debes enviar password" });
    }

    // Usa 'name' o 'correo' para la búsqueda
    const loginField = correo || name;

    // Buscar por 'name' o 'correo'
    let usuario = null;
    if (correo) {
      usuario = await Usuarios.findOne({ where: { correo } });
    } else {
      usuario = await Usuarios.findOne({ where: { name } });
    }

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Comparar la contraseña
    let ok = false;
    if (typeof usuario.password === "string" && /^\$2[aby]\$/.test(usuario.password)) {
      ok = await bcrypt.compare(password, usuario.password);
    } else {
      ok = usuario.password === password;
    }

    if (!ok) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: usuario.id_users, name: usuario.name, typeUser: usuario.typeUser },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    return res.status(200).json({
      token,
      idUser: usuario.id_users,   
      rol: usuario.typeUser       
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
