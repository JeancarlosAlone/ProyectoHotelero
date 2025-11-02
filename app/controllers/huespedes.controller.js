  const huespedService = require('../services/huespedes.service'); 
  const ApiResponse = require('../utils/apiResponse');

  // ================== GET ALL ==================
  exports.getAllHuespedes = async (_req, res) => {
    try {
      const huespedes = await huespedService.getAllHuespedes();
      // El front espera un array directo (aunque esté vacío)
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
      const nuevo = await huespedService.createHuesped(req.body);
      return res.status(201).json(ApiResponse("Huésped creado con éxito", 201, nuevo));
    } catch (err) {
      return res.status(400).json(ApiResponse(err.message, 400, null));
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
