const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false }
  },
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.usuarios  = require("./usuarios.model.js")(sequelize, Sequelize);
db.rooms     = require("./rooms.model.js")(sequelize, Sequelize);
db.huespedes = require("./huespedes.model.js")(sequelize, Sequelize);
db.pagos = require("./pago.model.js")(sequelize, Sequelize);
db.facturas = require("./facturas.model.js")(sequelize, Sequelize);


// Relaciones (para poder hacer include con los alias que usa el front)
db.huespedes.belongsTo(db.usuarios, {
  foreignKey: "id_users",
  as: "usuarioRegistrador"
});
db.huespedes.belongsTo(db.rooms, {
  foreignKey: "id_Rooms",
  as: "habitacionAsignada"
});

// (Opcional, inversas: no son necesarias para el include, pero ayudan)
db.usuarios.hasMany(db.huespedes, {
  foreignKey: "id_users",
  as: "huespedesRegistrados"
});
db.rooms.hasMany(db.huespedes, {
  foreignKey: "id_Rooms",
  as: "huespedes"
});

module.exports = db;
