const db = require("../models");
const Usuarios = db.usuarios;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const jwtConfig = require("../config/jwt.config");
const ApiResponse = require("../utils/apiResponse");

// Detecta si el string parece un hash de bcrypt
const isBcryptHash = (s) => typeof s === "string" && /^\$2[aby]\$/.test(s);

// Genera ID: 1ra letra nombre + 1ra letra apellido + 0000..9999
async function generateUniqueId(name, apellido) {
  const n = (name?.trim()?.[0] || "").toUpperCase();
  const a = (apellido?.trim()?.[0] || "").toUpperCase();
  if (!n || !a) throw new Error("Nombre y apellido requeridos para generar id_users");

  let id, exists = true;
  while (exists) {
    const num = Math.floor(Math.random() * 10000); // 0..9999
    id = `${n}${a}${String(num).padStart(4, "0")}`;
    exists = !!(await Usuarios.findByPk(id));
  }
  return id;
}

// ==================== LOGIN ====================
exports.login = async (req, res) => {
  try {
    const { id_users, name, username, password } = req.body;

    if (!id_users && !name && !username) {
      return res.status(400).json({ message: "Debes enviar id_users o name/username" });
    }
    if (!password) {
      return res.status(400).json({ message: "Debes enviar password" });
    }

    const loginName = username || name;

    // Buscar por id_users o por name
    let usuario = null;
    if (id_users) {
      usuario = await Usuarios.findByPk(id_users);
    } else {
      usuario = await Usuarios.findOne({ where: { name: username || name } });
    }

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Comparar contraseña (hash o texto plano)
    let ok = false;
    if (typeof usuario.password === "string" && /^\$2[aby]\$/.test(usuario.password)) {
      ok = await bcrypt.compare(password, usuario.password);
    } else {
      ok = usuario.password === password;
    }
    if (!ok) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Generar token
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

// ==================== REGISTER ====================
exports.register = async (req, res) => {
  try {
    const { name, apellido, password, typeUser = "user" } = req.body;

  
    if (!name || !apellido || !password) {
      return res.status(400).json(ApiResponse("Faltan campos requeridos", 400, null));
    }

    // Generar id único estilo Sprint
    const id_users = await generateUniqueId(name, apellido);

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear usuario
    const nuevo = await Usuarios.create({
      id_users,
      name,
      apellido,
      password: passwordHash,
      typeUser,
      fechaIngreso: new Date(),
    });

    // Respuesta estilo ApiResponse
    return res
      .status(201)
      .json(
        ApiResponse("Usuario registrado con éxito", 201, {
          id_users: nuevo.id_users,
          name: nuevo.name,
          apellido: nuevo.apellido,
          typeUser: nuevo.typeUser,
          fechaIngreso: nuevo.fechaIngreso,
        })
      );
  } catch (err) {
    return res.status(500).json(ApiResponse(err.message, 500, null));
  }
};
