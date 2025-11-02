const db = require("../models");
const Usuarios = db.usuarios;
const ApiResponse = require("../utils/apiResponse");

// --- Función auxiliar para generar IDs únicos ---
function generarIdUnico(nombre, apellido) {
  const firstLetterNombre = nombre.charAt(0).toUpperCase();
  const firstLetterApellido = apellido.charAt(0).toUpperCase();
  const randomNumber = Math.floor(Math.random() * 10000);
  return `${firstLetterNombre}${firstLetterApellido}${randomNumber
    .toString()
    .padStart(4, "0")}`;
}

// Crear usuario (POST /api/usuarios ó /users)
exports.createUser = async (req, res) => {
  try {
    const { name, apellido, password, typeUser, imagenBase64 } = req.body;

    const generatedId = generarIdUnico(name, apellido);

    const newUser = {
      id_users: generatedId,
      name,
      apellido,
      password,        
      typeUser,
      imagenBase64: imagenBase64 || null,   
      fechaIngreso: new Date()
    };

    const usuario = await Usuarios.create(newUser);
    return res.status(201).json(ApiResponse("Usuario creado", 201, usuario));
  } catch (err) {
    return res.status(500).json(ApiResponse(err.message, 500, null));
  }
};

// Obtener todos los usuarios (GET /users)
exports.getAllUsers = async (_req, res) => {
  try {
    const usuarios = await Usuarios.findAll({ raw: true });

    const out = (usuarios || []).map(u => ({
      ...u,
      password: '********',
     
      imagenBase64: u.imagenBase64
        ? `http://localhost:8080/users/${u.id_users}/photo`
        : ''
    }));

    return res.status(200).json(out);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Servir la foto (GET /users/:id/photo)
exports.getUserPhoto = async (req, res) => {
  try {
    const user = await Usuarios.findByPk(req.params.id, {
      attributes: ['imagenBase64']
    });
    if (!user || !user.imagenBase64) return res.status(404).end();

    const buf = Buffer.from(user.imagenBase64, 'base64');
    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'no-store');
    return res.send(buf);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};



// Obtener usuario por ID (GET /users/:id)
exports.getUserById = async (req, res) => {
  try {
    const id = req.params.id;
    const usuario = await Usuarios.findByPk(id);
    if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });

    const plain = usuario.get({ plain: true });
    const out = {
      ...plain,
      password: '********',
      // si hay foto en BD, devolvemos la URL del endpoint de imagen
      imagenBase64: plain.imagenBase64 ? `http://localhost:8080/users/${id}/photo` : ''
    };

    return res.status(200).json(out); // objeto directo
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


// Actualizar usuario (PUT /api/usuarios/:id ó /users/:id)
exports.updateUser = async (req, res) => {
  try {
    const usuario = await Usuarios.findByPk(req.params.id);
    if (!usuario) {
      return res.status(404).json(ApiResponse("Usuario no encontrado", 404, null));
    }

    // Campos siempre actualizables
    usuario.name      = req.body.name      ?? usuario.name;
    usuario.apellido  = req.body.apellido  ?? usuario.apellido;
    usuario.typeUser  = req.body.typeUser  ?? usuario.typeUser;

    // Imagen (base64)
    if (req.body.imagenBase64 !== undefined) {
      usuario.imagenBase64 = req.body.imagenBase64 || null;
    }

    // Contraseña
    const passFromFront = req.body.password;
    if (typeof passFromFront === 'string' && passFromFront.trim() !== '' && passFromFront !== '********') {
      const PASS_REGEX = /^(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
      if (!PASS_REGEX.test(passFromFront)) {
        return res.status(400).json(ApiResponse(
          "La contraseña debe tener mínimo 8 caracteres, al menos 1 mayúscula y 1 símbolo.",
          400,
          null
        ));
      }
      usuario.password = passFromFront;
    }

    await usuario.save();
    return res.status(200).json(ApiResponse("Usuario actualizado", 200, usuario));
  } catch (err) {
    return res.status(500).json(ApiResponse(err.message, 500, null));
  }
};


// Eliminar usuario (DELETE /api/usuarios/:id)
exports.deleteUser = async (req, res) => {
  try {
    const usuario = await Usuarios.findByPk(req.params.id);
    if (!usuario) {
      return res.status(404).json(ApiResponse("Usuario no encontrado", 404, null));
    }

    await usuario.destroy();
    return res.status(204).json(ApiResponse("Usuario eliminado con éxito", 204, null));
  } catch (err) {
    return res.status(500).json(ApiResponse(err.message, 500, null));
  }
};

