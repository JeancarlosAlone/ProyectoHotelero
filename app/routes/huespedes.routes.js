const express = require('express');
const router = express.Router();
const huespedesController = require('../controllers/huespedes.controller');

// ================== RUTAS ==================

// GET todos los huéspedes
router.get('/', huespedesController.getAllHuespedes);

// GET huésped por ID
router.get('/:id', huespedesController.getHuespedById);

// POST crear huésped
router.post('/', huespedesController.createHuesped);

// PUT actualizar huésped
router.put('/:id', huespedesController.updateHuesped);

// DELETE eliminar huésped
router.delete('/:id', huespedesController.deleteHuesped);

module.exports = router;
