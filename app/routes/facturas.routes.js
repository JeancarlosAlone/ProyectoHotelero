const express = require("express");
const router = express.Router();
const { generarFactura } = require("../controllers/facturas.controller.js");
const { listarFacturas } = require("../controllers/facturas.controller.js");

router.post("/generar", generarFactura);
router.get("/listar", listarFacturas);

module.exports = router;
