// app/routes/clientes.routes.js
const express = require("express");
const router = express.Router();
const clientes = require("../controllers/clientes.controller.js");

// Registrar nuevo cliente
router.post("/register", clientes.register);

// Login cliente
router.post("/login", clientes.login);

module.exports = router;
