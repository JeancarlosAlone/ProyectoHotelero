const db = require('../models');
const Huespedes = db.huespedes;

// Generador de ID único (2 letras + 4 dígitos)
async function generateUniqueId(nombre, apellido) {
  const firstLetterNombre = (nombre?.trim()?.[0] || "").toUpperCase();
  const firstLetterApellido = (apellido?.trim()?.[0] || "").toUpperCase();
  let id, exists = true;

  while (exists) {
    const num = Math.floor(Math.random() * 10000); // 0..9999
    id = `${firstLetterNombre}${firstLetterApellido}${String(num).padStart(4, "0")}`;
    const found = await Huespedes.findByPk(id);
    exists = !!found;
  }
  return id;
}

async function getAllHuespedes() {
  const { usuarios, rooms } = db;

  return Huespedes.findAll({
    attributes: [
      'idHuesped',
      'nameHuesped',
      'apellidoHuesped',
      'telefono',
      'numPersonas',
      'monto',
      'statusHuesped',
      'fechaRegistro',
      'fechaSalida'
    ],
    include: [
      {
        model: usuarios,
        as: 'usuarioRegistrador',
        attributes: ['id_users', 'name', 'apellido', 'typeUser']
      },
      {
        model: rooms,
        as: 'habitacionAsignada',
        attributes: ['id_Rooms', 'habitacion', 'nivel', 'estado', 'precio']
      }
    ],
    order: [['fechaRegistro', 'DESC']]
  });
}

async function getHuespedById(id) {
  const { usuarios, rooms } = db;

  return Huespedes.findByPk(id, {
    attributes: [
      'idHuesped',
      'nameHuesped',
      'apellidoHuesped',
      'telefono',
      'numPersonas',
      'monto',
      'statusHuesped',
      'fechaRegistro',
      'fechaSalida'
    ],
    include: [
      {
        model: usuarios,
        as: 'usuarioRegistrador',
        attributes: ['id_users', 'name', 'apellido', 'typeUser']
      },
      {
        model: rooms,
        as: 'habitacionAsignada',
        attributes: ['id_Rooms', 'habitacion', 'nivel', 'estado', 'precio'] // ← FIX
      }
    ]
  });
}

async function createHuesped(data) {
  // Validar fecha de salida > now
  if (data.fechaSalida && new Date(data.fechaSalida) <= new Date()) {
    throw new Error("La fecha de salida no puede ser menor o igual a la fecha actual");
  }

  // Mapear FKs desde el objeto que manda el front
  const id_users = data.usuarioRegistrador?.id_users ?? data.id_users ?? null;
  const id_Rooms = data.habitacionAsignada?.id_Rooms ?? data.id_Rooms ?? null;

  const payload = {
    idHuesped: await generateUniqueId(data.nameHuesped, data.apellidoHuesped),
    nameHuesped: data.nameHuesped,
    apellidoHuesped: data.apellidoHuesped,
    telefono: data.telefono,
    numPersonas: data.numPersonas,
    monto: data.monto,
    statusHuesped: data.statusHuesped,
    fechaRegistro: new Date(),
    fechaSalida: data.fechaSalida,
    id_users,
    id_Rooms,
  };

  return Huespedes.create(payload);
}

async function updateHuesped(id, data) {
  const existe = await Huespedes.findByPk(id);
  if (!existe) throw new Error("Huésped no encontrado");

  const id_users = data.usuarioRegistrador?.id_users ?? data.id_users ?? existe.id_users;
  const id_Rooms = data.habitacionAsignada?.id_Rooms ?? data.id_Rooms ?? existe.id_Rooms;

  const payload = {
    nameHuesped: data.nameHuesped ?? existe.nameHuesped,
    apellidoHuesped: data.apellidoHuesped ?? existe.apellidoHuesped,
    telefono: data.telefono ?? existe.telefono,
    numPersonas: data.numPersonas ?? existe.numPersonas,
    monto: data.monto ?? existe.monto,
    statusHuesped: data.statusHuesped ?? existe.statusHuesped,
    fechaRegistro: data.fechaRegistro ?? existe.fechaRegistro,
    fechaSalida: data.fechaSalida ?? existe.fechaSalida,
    id_users,
    id_Rooms,
  };

  await Huespedes.update(payload, { where: { idHuesped: id } });
  return Huespedes.findByPk(id);
}

async function deleteHuesped(id) {
  // devolvemos cuántas filas se borraron
  return Huespedes.destroy({ where: { idHuesped: id } });
}

async function existeHuesped(id) {
  const found = await Huespedes.findByPk(id);
  return !!found;
}

module.exports = {
  getAllHuespedes,
  getHuespedById,
  createHuesped,
  updateHuesped,
  deleteHuesped,
  existeHuesped
};
