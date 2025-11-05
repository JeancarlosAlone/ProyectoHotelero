const express = require('express');
const router = express.Router();
const serviciosCtrl = require('../controllers/serviciosHuesped.controller');

// 🔹 Rutas principales
router.get('/', serviciosCtrl.getAllServicios);
router.get('/:idHuesped', serviciosCtrl.getServiciosByHuesped);
router.post('/', serviciosCtrl.createServicio);
router.delete('/:id', serviciosCtrl.deleteServicio);

module.exports = router;
