const huespedService = require('../services/huespedes.service');
const ApiResponse = require('../utils/apiResponse');
const db = require('../models');
const { Op } = require('sequelize');

/**
 * ================================
 * 🔹 GET: TODOS LOS HUÉSPEDES
 * ================================
 */
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

    // 💵 Agregar conversión a USD
    const tipoCambio = 7.75;
    const huespedesUSD = huespedes.map(h => {
      const data = h.toJSON ? h.toJSON() : h;
      data.montoUSD = data.monto ? parseFloat((data.monto / tipoCambio).toFixed(2)) : null;
      return data;
    });

    return res.status(200).json(huespedesUSD || []);
  } catch (err) {
    console.error("Error en getAllHuespedes:", err);
    return res.status(500).json({ message: err.message });
  }
};

/**
 * ================================
 * 🔹 GET: HUÉSPED POR ID
 * ================================
 */
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

/**
 * ================================
 * 🔹 CREATE: NUEVO HUÉSPED
 * ================================
 */
exports.createHuesped = async (req, res) => {
  try {
    // 1️⃣ Crear huésped principal
    const nuevo = await huespedService.createHuesped(req.body);

    // 2️⃣ Guardar servicios adicionales si existen
    if (req.body.serviciosSeleccionados?.length > 0) {
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
      console.log(`✅ ${serviciosAInsertar.length} servicios guardados para huésped ${nuevo.idHuesped}`);
    }

    return res.status(201).json({
      message: 'Huésped creado con éxito',
      huesped: nuevo
    });
  } catch (err) {
    console.error('❌ Error al crear huésped:', err);
    return res.status(400).json({
      message: 'Error al crear huésped',
      error: err.message
    });
  }
};

/**
 * ================================
 * 🔹 GET: HUÉSPEDES PENDIENTES DE PAGO
 * ================================
 */
exports.getPendientesPago = async (req, res) => {
  try {
    const { nombre, fecha } = req.query;

    const whereClause = { statusHuesped: 'pendiente de pago' };

    if (nombre) {
      whereClause[Op.or] = [
        { nameHuesped: { [Op.iLike]: `%${nombre}%` } },
        { apellidoHuesped: { [Op.iLike]: `%${nombre}%` } }
      ];
    }

    if (fecha) whereClause.fechaRegistro = fecha;

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
        'fechaSalida'
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
        message: 'No hay huéspedes pendientes de pago',
        status: 404,
        data: []
      });
    }

    // 💵 Calcular monto en dólares
    const tipoCambio = 7.75;
    const pendientesUSD = pendientes.map(h => {
      const data = h.toJSON();
      data.montoUSD = data.monto ? parseFloat((data.monto / tipoCambio).toFixed(2)) : null;
      return data;
    });

    return res.status(200).json(pendientesUSD);
  } catch (error) {
    console.error('❌ Error en getPendientesPago:', error);
    res.status(500).json({
      message: 'Error al obtener huéspedes pendientes',
      error: error.message
    });
  }
};

/**
 * ================================
 * 🔹 UPDATE: HUÉSPED
 * ================================
 */
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

/**
 * ================================
 * 🔹 DELETE: HUÉSPED
 * ================================
 */
exports.deleteHuesped = async (req, res) => {
  try {
    const id = req.params.id;
    const rowsDeleted = await huespedService.deleteHuesped(id);

    if (rowsDeleted === 0) {
      return res.status(404).json({ message: "Huésped no encontrado" });
    }

    return res.status(200).json({ message: "Huésped eliminado", id, deleted: true });
  } catch (err) {
    return res.status(500).json({ message: "Error al eliminar huésped: " + err.message });
  }
};
