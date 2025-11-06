
const db = require('../models');
const Huespedes = db.huespedes;
const { Op } = db.Sequelize;

async function generateUniqueId(nombre, apellido) {
  const firstLetterNombre = (nombre?.trim()?.[0] || "").toUpperCase();
  const firstLetterApellido = (apellido?.trim()?.[0] || "").toUpperCase();
  let id, exists = true;

  while (exists) {
    const num = Math.floor(Math.random() * 10000);
    id = `${firstLetterNombre}${firstLetterApellido}${String(num).padStart(4, "0")}`;
    const found = await Huespedes.findByPk(id);
    exists = !!found;
  }
  return id;
}

async function getAllHuespedes() {
  const { usuarios, rooms } = db;

  const huespedes = await Huespedes.findAll({
    attributes: [
      'idHuesped',
      'nameHuesped',
      'apellidoHuesped',
      'telefono',
      'numPersonas',
      'monto',
      'statusHuesped',
      'fechaRegistro',
      'fechaSalida',
      'id_users'
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

  return huespedes.map(h => ({
    ...h.toJSON(),
    tipoRegistro: h.id_users ? 'manual' : 'enLinea'
  }));
}

async function getHuespedesManuales() {
  const { usuarios, rooms } = db;
  return Huespedes.findAll({
    where: { id_users: { [Op.ne]: null } },
    attributes: [
      'idHuesped', 'nameHuesped', 'apellidoHuesped', 'telefono',
      'numPersonas', 'monto', 'statusHuesped', 'fechaRegistro', 'fechaSalida', 'id_users',
      [db.sequelize.literal(
        `CASE WHEN "huespedes"."id_users" IS NULL THEN 'enLinea' ELSE 'manual' END`
      ), 'tipoRegistro']
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

async function getHuespedesEnLinea() {
  const { usuarios, rooms } = db;
  return Huespedes.findAll({
    where: { id_users: null },
    attributes: [
      'idHuesped', 'nameHuesped', 'apellidoHuesped', 'telefono',
      'numPersonas', 'monto', 'statusHuesped', 'fechaRegistro', 'fechaSalida', 'id_users',
      [db.sequelize.literal(
        `CASE WHEN "huespedes"."id_users" IS NULL THEN 'enLinea' ELSE 'manual' END`
      ), 'tipoRegistro']
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
      'fechaSalida',
      'id_users'
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
    ]
  });
}

async function createHuesped(data) {
  if (data.fechaSalida && new Date(data.fechaSalida) <= new Date()) {
    throw new Error("La fecha de salida no puede ser menor o igual a la fecha actual");
  }

  const id_users = data.usuarioRegistrador?.id_users ?? data.id_users ?? null;
  const id_Rooms = data.habitacionAsignada?.id_Rooms ?? data.id_Rooms ?? null;

  const estadoPago = data.statusHuesped || "pendiente de pago";

  const payload = {
    idHuesped: await generateUniqueId(data.nameHuesped, data.apellidoHuesped),
    nameHuesped: data.nameHuesped,
    apellidoHuesped: data.apellidoHuesped,
    telefono: data.telefono,
    numPersonas: data.numPersonas,
    monto: data.monto,
    statusHuesped: estadoPago,
    fechaRegistro: new Date(),
    fechaSalida: data.fechaSalida,
    id_users,
    id_Rooms,
  };

  const nuevoHuesped = await Huespedes.create(payload);

  if (id_Rooms) {
    const room = await db.rooms.findByPk(id_Rooms);
    if (room) {
      room.estado = "ocupada"; 
      await room.save();
    }
  }

  return nuevoHuesped;
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
    id_Rooms
  };

  await Huespedes.update(payload, { where: { idHuesped: id } });
  return Huespedes.findByPk(id);
}

async function deleteHuesped(id) {
  return Huespedes.destroy({ where: { idHuesped: id } });
}

async function existeHuesped(id) {
  const found = await Huespedes.findByPk(id);
  return !!found;
}

module.exports = {
  getAllHuespedes,
  getHuespedesManuales,
  getHuespedesEnLinea,
  getHuespedById,
  createHuesped,
  updateHuesped,
  deleteHuesped,
  existeHuesped
};




