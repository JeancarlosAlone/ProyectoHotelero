const express = require("express");
const router = express.Router();

const { crearOrdenPago, capturarPago } = require("../controllers/pagos.controller");

// Ruta para crear orden de pago
router.post("/crear-orden", crearOrdenPago);
router.post("/capturar-orden", capturarPago);

module.exports = router;


