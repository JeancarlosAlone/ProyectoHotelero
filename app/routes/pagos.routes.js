const express = require("express");
const router = express.Router();

const { crearOrdenPago, capturarPago, registrarPago } = require("../controllers/pagos.controller");

// Ruta para crear orden de pago
router.post("/crear-orden", crearOrdenPago);
router.post("/capturar-orden", capturarPago);

// Nueva ruta para registrar pagos manuales / administrativos
router.post("/registrar", registrarPago);

module.exports = router;
