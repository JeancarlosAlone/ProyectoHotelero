const db = require('../models');
const { Op } = require('sequelize');
const Rooms = db.rooms;

module.exports = {
  // GET all
  async getAllRooms() {
    return Rooms.findAll();
  },

  // GET by id
  async getRoomById(id) {
    return Rooms.findByPk(id);
  },

  // POST save (crear habitación)
  async createRoom(room) {
    return Rooms.create({
      id_Rooms: room.id_Rooms,
      habitacion: room.habitacion,
      nivel: room.nivel,
      estado: room.estado,
      precio: room.precio,
      image_url: room.image_url || null,
    });
  },

  async updateRoom(id, room) {
    const exists = await Rooms.findByPk(id);
    if (!exists) throw new Error('Habitación no encontrada');

    const updateData = {};
    if (room.habitacion !== undefined) updateData.habitacion = room.habitacion;
    if (room.nivel !== undefined) updateData.nivel = room.nivel;
    if (room.estado !== undefined) updateData.estado = room.estado;
    if (room.precio !== undefined) updateData.precio = room.precio;
    if (room.image_url !== undefined) updateData.image_url = room.image_url;

    await Rooms.update(updateData, { where: { id_Rooms: id } });

    return Rooms.findByPk(id);
  },

  // DELETE
  async deleteRoom(id) {
    await Rooms.destroy({ where: { id_Rooms: id } });
  },

  async existeRoom(id) {
    const found = await Rooms.findByPk(id);
    return !!found;
  },

  async getRoomsDisponibles(fechaInicio, fechaFin, numPersonas) {
    const { huespedes } = db;

    try {
      const huespedesOcupando = await huespedes.findAll({
        where: {
          statusHuesped: { [Op.ne]: 'cancelado' },
          [Op.or]: [
            { fechaRegistro: { [Op.between]: [fechaInicio, fechaFin] } },
            { fechaSalida: { [Op.between]: [fechaInicio, fechaFin] } },
            {
              fechaRegistro: { [Op.lte]: fechaInicio },
              fechaSalida: { [Op.gte]: fechaFin },
            },
          ],
        },
        attributes: ['id_Rooms'],
      });

      const idsOcupadas = huespedesOcupando.map(h => h.id_Rooms);

      const whereClause = {
        estado: 'libre',
        ...(idsOcupadas.length ? { id_Rooms: { [Op.notIn]: idsOcupadas } } : {}),
      };

      return Rooms.findAll({
        where: whereClause,
        order: [['nivel', 'ASC']],
      });
    } catch (error) {
      console.error("Error al obtener habitaciones disponibles:", error);
      throw new Error("No se pudo obtener la lista de habitaciones disponibles");
    }
  },
};
