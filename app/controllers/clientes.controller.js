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

// === Login cliente ===
exports.login = async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ message: 'Debe ingresar nombre de usuario/correo y contraseña.' });
    }

    // Buscar por correo o nombre
    const cliente = await Clientes.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { correo: correo },
          { nombre: correo } // permite login con nombre
        ]
      }
    });

    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado.' });
    }

    const validPassword = await bcrypt.compare(password, cliente.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Contraseña incorrecta.' });
    }

    return res.status(200).json({
      message: 'Inicio de sesión exitoso.',
      cliente: {
        id_cliente: cliente.id_cliente,
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        correo: cliente.correo,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al iniciar sesión.', error: err.message });
  }
};


