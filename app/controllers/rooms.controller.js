const roomService = require('../services/rooms.service');
const ApiResponse = require('../utils/apiResponse');

// GET all
exports.getAll = async (req, res) => {
  try {
    const rooms = await roomService.getAllRooms();
    return res.status(200).json(rooms || []);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET by id
exports.getById = async (req, res) => {
  try {
    const room = await roomService.getRoomById(req.params.id);
    if (!room) return res.status(404).json({ message: "Habitación no encontrada" });
    return res.status(200).json(room);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// POST create
exports.create = async (req, res) => {
  try {
    // ✅ Aceptamos varios nombres para evitar conflictos
    const {
      id_Rooms,
      habitacion,
      nivel,
      estado,
      precio,
      image_url,
      imagenUrl,
      imageUrl
    } = req.body;

    const exists = await roomService.getRoomById(id_Rooms);
    if (exists) {
      return res
        .status(409)
        .json(ApiResponse("La habitación ya existe", 409, null));
    }

    // ✅ Unificamos el nombre del campo antes de enviarlo al servicio
    const newRoom = await roomService.createRoom({
      id_Rooms,
      habitacion,
      nivel,
      estado,
      precio,
      image_url: image_url || imagenUrl || imageUrl || null,
    });

    res
      .status(201)
      .json(ApiResponse("Habitación creada con éxito", 201, newRoom));
  } catch (err) {
    res.status(400).json(ApiResponse(err.message, 400));
  }
};

// PUT update
exports.update = async (req, res) => {
  try {
    const {
      habitacion,
      nivel,
      estado,
      precio,
      image_url,
      imagenUrl,
      imageUrl
    } = req.body;

    const id = req.params.id;

    const updated = await roomService.updateRoom(id, {
      habitacion,
      nivel,
      estado,
      precio,
      image_url: image_url || imagenUrl || imageUrl || null,
    });

    res.json(ApiResponse("Habitación actualizada con éxito", 200, updated));
  } catch (err) {
    res.status(404).json(ApiResponse(err.message, 404));
  }
};

// DELETE
exports.delete = async (req, res) => {
  try {
    const exists = await roomService.getRoomById(req.params.id);
    if (!exists) {
      return res.status(404).json(ApiResponse("Habitación no encontrada", 404, null));
    }
    await roomService.deleteRoom(req.params.id);
    res.status(200).json(ApiResponse("Habitación eliminada con éxito", 200, null));
  } catch (err) {
    res.status(500).json(ApiResponse(err.message, 500));
  }
};

// EXISTS
exports.exists = async (req, res) => {
  try {
    const exists = await roomService.existeRoom(req.params.id);
    res.json(ApiResponse('Estado de existencia verificado', 200, { exists }));
  } catch (err) {
    res.status(500).json(ApiResponse(err.message, 500));
  }
};

// PATCH estado
exports.changeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const ALLOWED = ['ocupada', 'libre', 'limpieza'];
    if (!ALLOWED.includes(estado)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }

    const room = await roomService.getRoomById(id);
    if (!room) {
      return res.status(404).json({ message: 'Habitación no encontrada' });
    }

    const updatedRoom = await roomService.updateRoom(id, { estado });

    return res.status(200).json({
      message: `Estado de habitación actualizado a ${updatedRoom.estado}`,
      data: updatedRoom
    });

  } catch (err) {
    console.error('Error en changeStatus:', err);
    return res.status(500).json({ message: 'Error interno al cambiar el estado', error: err.message });
  }
};


// GET habitaciones disponibles
exports.getDisponibles = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, numPersonas } = req.query;

    const rooms = await roomService.getRoomsDisponibles(fechaInicio, fechaFin, numPersonas);
    return res.status(200).json(rooms || []);
  } catch (err) {
    return res.status(500).json({ message: 'Error al obtener disponibilidad', error: err.message });
  }
};
