// app/controllers/clientes.controller.js
const db = require('../models');
const Clientes = db.clientes;
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const jwtConfig = require("../config/jwt.config");

// Función para generar un ID único tipo CL0001
async function generarIdCliente() {
  let id;
  let existe = true;
  while (existe) {
    const numero = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    id = `CL${numero}`;
    const clienteExistente = await Clientes.findByPk(id);
    if (!clienteExistente) existe = false;
  }
  return id;
}

// === Registrar nuevo cliente ===
exports.register = async (req, res) => {
  try {
    const { nombre, apellido, correo, password } = req.body;

    if (!nombre || !apellido || !correo || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    const existeCorreo = await Clientes.findOne({ where: { correo } });
    if (existeCorreo) {
      return res.status(400).json({ message: 'Ya existe un cliente con ese correo.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id_cliente = await generarIdCliente();

    const nuevoCliente = await Clientes.create({
      id_cliente,
      nombre,
      apellido,
      correo,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: 'Cliente registrado correctamente.',
      data: nuevoCliente,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al registrar cliente.', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { correo, nombre, password } = req.body;

    if (!correo && !nombre) {
      return res.status(400).json({ message: "Debes enviar correo o nombre" });
    }

    if (!password) {
      return res.status(400).json({ message: "Debes enviar la contraseña" });
    }

    // Buscar cliente por correo o nombre
    const whereClause = correo ? { correo } : { nombre };
    const cliente = await Clientes.findOne({ where: whereClause });

    if (!cliente) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    let ok = false;
    if (cliente.password.startsWith("$2")) {
      ok = await bcrypt.compare(password, cliente.password);
    } else {
      ok = cliente.password === password;
    }

    if (!ok) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Generar token
    const token = jwt.sign(
      { id: cliente.id_cliente, nombre: cliente.nombre, tipo: "cliente" },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    return res.status(200).json({
      message: "Login exitoso",
      token,
      cliente: {
        id: cliente.id_cliente,
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        correo: cliente.correo,
      },
    });
  } catch (error) {
    console.error("Error en login cliente:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};


