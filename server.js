require('dotenv').config();
const paypal = require("@paypal/checkout-server-sdk");
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');  // Agregar multer
const db = require('./app/models'); // ORM
const bcrypt = require('bcrypt');

const app = express();

// Configurar Multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Guardamos las imágenes en la carpeta 'uploads'
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Asignamos un nombre único a cada archivo subido
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Crear el middleware para cargar la imagen
const upload = multer({ storage: storage });

const corsOptions = {
  origin: [
    "https://olympusf.onrender.com", // tu dominio FRONTEND en Render
    "http://localhost:4200"          // opcional: desarrollo local
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(cors(corsOptions));


// Body parser (aumentamos límite para imágenes base64)
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

(async () => {
  try {
    await db.sequelize.sync();
    console.log('Conexión a la base de datos establecida correctamente.');
    await db.sequelize.sync(); // sincroniza modelos
  } catch (err) {
    console.error('Error al conectar a la base de datos:', err);
  }
})();

app.get('/', (req, res) => {
  res.send('Servidor Node.js funcionando correctamente 🚀');
});

app.use('/facturas', express.static(path.join(__dirname, 'facturas')));


// Rutas de API (ya existentes)
const usuariosRoutes = require('./app/routes/usuarios.routes');
const authRoutes = require('./app/routes/auth.routes');
const roomsRoutes = require('./app/routes/rooms.routes');
const huespedesRoutes = require('./app/routes/huespedes.routes');
const pagosRoutes = require('./app/routes/pagos.routes');
const facturasRoutes = require('./app/routes/facturas.routes');
const clientesRoutes = require('./app/routes/clientes.routes');
const serviciosHuespedRoutes = require('./app/routes/serviciosHuesped.routes');

// Prefijo principal
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/huespedes', huespedesRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/facturas', facturasRoutes);
app.use("/api/clientes", clientesRoutes);
app.use('/api/servicios-huesped', serviciosHuespedRoutes);

// Subir la imagen de un servicio (ruta para manejo de imágenes)
app.post('/api/upload', upload.single('imagen'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }
  
  // Respondemos con la URL de la imagen que se acaba de cargar
  const imageUrl = `http://localhost:8080/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// Servir imágenes desde la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Alias opcionales (sin /api)
app.use('/auth', authRoutes);
app.use('/rooms', roomsRoutes);
app.use('/users', usuariosRoutes);
app.use('/huesped', huespedesRoutes);

// Servir archivos estáticos de facturas y assets
app.use('/facturas', express.static(path.join(__dirname, 'facturas')));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

// Configurar el puerto
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log('CLIENT ID (PayPal):', process.env.PAYPAL_CLIENT_ID || 'No definido');
});
