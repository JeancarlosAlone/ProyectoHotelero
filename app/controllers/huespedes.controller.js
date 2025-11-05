const huespedService = require('../services/huespedes.service');
const ApiResponse = require('../utils/apiResponse');
const db = require('../models');
const { Op } = require('sequelize');


exports.getAllHuespedes = async (req, res) => {
  try {
    const tipo = req.query.tipo || 'todos';
    let huespedes = [];

    if (tipo === 'manual') {
      huespedes = await huespedService.getHuespedesManuales();
    } else if (tipo === 'enlinea') {
      huespedes = await huespedService.getHuespedesEnLinea();
    } else {
      huespedes = await huespedService.getAllHuespedes();
    }

    return res.status(200).json(huespedes || []);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};




// ================== GET BY ID ==================
exports.getHuespedById = async (req, res) => {
  try {
    const id = req.params.id;
    const huesped = await huespedService.getHuespedById(id);

    if (!huesped) {
      return res.status(404).json(ApiResponse("Huésped no encontrado", 404, null));
    }

    return res.status(200).json(ApiResponse("OK", 200, huesped));
  } catch (err) {
    return res.status(500).json(ApiResponse(err.message, 500, null));
  }
};

// ================== CREATE ==================
exports.createHuesped = async (req, res) => {
  try {
    // 1️⃣ Crear el huésped
    const nuevo = await huespedService.createHuesped(req.body);

    // 2️⃣ Si vienen servicios adicionales, los guardamos
    if (req.body.serviciosSeleccionados && req.body.serviciosSeleccionados.length > 0) {
      const db = require('../models');
      const ServicioHuesped = db.servicio_huesped;

      const serviciosAInsertar = req.body.serviciosSeleccionados.map(serv => ({
        idHuesped: nuevo.idHuesped,
        nombre: serv.nombre,
        descripcion: serv.descripcion || '',
        precio: serv.precio,
        descuento: serv.descuento || 0,
        precioFinal: serv.precioFinal
      }));

      await ServicioHuesped.bulkCreate(serviciosAInsertar);
      console.log(`${serviciosAInsertar.length} servicios guardados para huésped ${nuevo.idHuesped}`);
    }

    // 3️⃣ Respuesta final
    return res.status(201).json({
      message: 'Huésped creado con éxito',
      huesped: nuevo
    });
  } catch (err) {
    console.error('Error al crear huésped:', err);
    return res.status(400).json({
      message: 'Error al crear huésped',
      error: err.message
    });
  }
};

exports.getPendientesPago = async (req, res) => {
  try {
    const { nombre, fecha } = req.query;

    const whereClause = { statusHuesped: 'pendiente de pago' };

    // 🔍 Búsqueda flexible por nombre o apellido
    if (nombre) {
      whereClause[Op.or] = [
        { nameHuesped: { [Op.iLike]: `%${nombre}%` } },
        { apellidoHuesped: { [Op.iLike]: `%${nombre}%` } }
      ];
    }

    if (fecha) {
      whereClause.fechaRegistro = fecha;
    }

    const pendientes = await db.huespedes.findAll({
      where: whereClause,
      attributes: [
        'idHuesped',
        'nameHuesped',
        'apellidoHuesped',
        'telefono',
        'email',
        'numPersonas',
        'monto',
        'statusHuesped',
        'fechaRegistro',
        'fechaSalida',
      ],
      include: [
        {
          model: db.rooms,
          as: 'habitacionAsignada',
          attributes: ['id_Rooms', 'habitacion', 'precio']
        },
        {
          model: db.servicio_huesped,
          as: 'servicios',
          attributes: ['nombre', 'precioFinal', 'descuento']
        }
      ],
      order: [['fechaRegistro', 'DESC']]
    });



    if (!pendientes || pendientes.length === 0) {
      return res.status(404).json({
        message: 'Huésped no encontrado',
        status: 404,
        data: null
      });
    }

    res.status(200).json(pendientes);
  } catch (error) {
    console.error('Error en getPendientesPago:', error);
    res.status(500).json({
      message: 'Error al obtener huéspedes pendientes',
      error: error.message
    });
  }
};


// ================== UPDATE ==================
exports.updateHuesped = async (req, res) => {
  try {
    const id = req.params.id;
    const existe = await huespedService.getHuespedById(id);

    if (!existe) {
      return res.status(404).json(ApiResponse("Huésped no encontrado", 404, null));
    }

    const actualizado = await huespedService.updateHuesped(id, req.body);
    return res.status(200).json(ApiResponse("Huésped actualizado", 200, actualizado));
  } catch (err) {
    return res.status(400).json(ApiResponse("Error en la actualización: " + err.message, 400, null));
  }
};

// ================== DELETE ==================
exports.deleteHuesped = async (req, res) => {
  try {
    const id = req.params.id;

    // devuelve cuántas filas se borraron
    const rowsDeleted = await huespedService.deleteHuesped(id);

    if (rowsDeleted === 0) {
      return res.status(404).json({ message: "Huésped no encontrado" });
    }

    // ← 200 con body en lugar de 204 vacío
    return res.status(200).json({ message: "Huésped eliminado", id, deleted: true });
  } catch (err) {
    return res.status(500).json({ message: "Error al eliminar huésped: " + err.message });
  }
};
