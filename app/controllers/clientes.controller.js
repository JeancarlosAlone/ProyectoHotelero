// app/controllers/clientes.controller.js
const db = require('../models');
const Clientes = db.clientes;
const bcrypt = require('bcrypt');

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
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ message: "Correo y contraseña son requeridos" });
    }

    const cliente = await Clientes.findOne({ where: { correo } });

    if (!cliente) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    // Verificar la contraseña
    const validPassword = await bcrypt.compare(password, cliente.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
  { id: cliente.id_cliente, name: cliente.nombre, typeUser: 'client' },
  jwtConfig.secret,
  { expiresIn: jwtConfig.expiresIn }
);


    res.status(200).json({ token, cliente: { id: cliente.id_cliente, name: cliente.nombre } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al autenticar el cliente" });
  }
};


