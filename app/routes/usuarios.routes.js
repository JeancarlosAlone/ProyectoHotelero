const express = require("express");
const router = express.Router();
const usuariosController = require("../controllers/usuarios.controller");
const { verifyToken } = require("../middlewares/authJwt"); 

//  Ruta pública (crear usuario, sin token)
router.post("/", usuariosController.createUser);

//  Rutas protegidas con JWT
router.get("/", verifyToken, usuariosController.getAllUsers);
router.get("/:id", verifyToken, usuariosController.getUserById);
router.put("/:id", verifyToken, usuariosController.updateUser);
router.delete("/:id", verifyToken, usuariosController.deleteUser);
router.get('/:id/photo', usuariosController.getUserPhoto);


module.exports = router;
