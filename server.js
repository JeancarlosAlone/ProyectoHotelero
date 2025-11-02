require('dotenv').config();
const bcrypt = require('bcrypt');
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Aumentamos límites del body
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

app.use(cors({ origin: 'http://localhost:4200', credentials: true }));

// Inicializa ORM (app/models/index.js)
const db = require('./app/models');

// Probar conexión a BD
(async () => {
  try {
    await db.sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
    await db.sequelize.sync();
  } catch (err) {
    console.error('Error al conectar a la base de datos:', err);
  }
})();

// Ruta base
app.get('/', (req, res) => {
  res.send('Servidor Node.js funcionando');
});

// Rutas
const usuariosRoutes = require("./app/routes/usuarios.routes");
const authRoutes = require("./app/routes/auth.routes");
const roomsRoutes = require("./app/routes/rooms.routes");
const huespedesRoutes = require("./app/routes/huespedes.routes");
const pagosRoutes = require("./app/routes/pagos.routes");
const facturasRoutes = require("./app/routes/facturas.routes");

app.use("/api/usuarios", usuariosRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomsRoutes);
app.use("/api/huespedes", huespedesRoutes);
app.use("/api/pagos", pagosRoutes);
app.use("/api/facturas", facturasRoutes);

// Compatibilidad sin /api
app.use("/auth", authRoutes);
app.use("/rooms", roomsRoutes);
app.use("/users", usuariosRoutes);
app.use("/huesped", huespedesRoutes);

// Servir carpetas públicas
app.use("/facturas", express.static(path.join(__dirname, "facturas")));
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
  console.log("CLIENT ID:", process.env.PAYPAL_CLIENT_ID);
});
