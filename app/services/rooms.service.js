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
    return Rooms.findByPk(id); // devuelve null si no existe
  },

  // POST save (crear habitación)
  async createRoom(room) {
    return Rooms.create(room);
  },

  // PUT update
  async updateRoom(id, room) {
    const exists = await Rooms.findByPk(id);
    if (!exists) throw new Error('Habitación no encontrada');

    await Rooms.update(room, { where: { id_Rooms: id } });
    return Rooms.findByPk(id);
  },

  // DELETE
  async deleteRoom(id) {
    await Rooms.destroy({ where: { id_Rooms: id } });
  },

  // existsById
  async existeRoom(id) {
    const found = await Rooms.findByPk(id);
    return !!found;
  },

  // ===============================================
  // NUEVA FUNCIÓN: obtener habitaciones disponibles
  // ===============================================
  async getRoomsDisponibles(fechaInicio, fechaFin, numPersonas) {
    const { huespedes } = db;

    try {
      // 1️⃣ Buscar huéspedes activos con fechas que se crucen con el rango dado
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

      // 2️⃣ Filtrar habitaciones que NO estén ocupadas y estén marcadas como "libre"
      const whereClause = {
        estado: 'libre',
        ...(idsOcupadas.length ? { id_Rooms: { [Op.notIn]: idsOcupadas } } : {})
      };

      // 3️⃣ Consultar habitaciones libres (ordenadas por nivel)
      const roomsDisponibles = await Rooms.findAll({
        where: whereClause,
        order: [['nivel', 'ASC']],
      });

      return roomsDisponibles;
    } catch (error) {
      console.error("Error al obtener habitaciones disponibles:", error);
      throw new Error("No se pudo obtener la lista de habitaciones disponibles");
    }
  },
};
