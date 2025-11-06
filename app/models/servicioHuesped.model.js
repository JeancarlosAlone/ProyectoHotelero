module.exports = (sequelize, Sequelize) => {
  const ServicioHuesped = sequelize.define(
    "servicio_huesped",
    {
      id_servicio: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      idHuesped: {
        type: Sequelize.STRING,
        allowNull: false
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      precio: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      descuento: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      precioFinal: {
        type: Sequelize.FLOAT,
        allowNull: false
      }
    },
    {
      freezeTableName: true,
      timestamps: true
    }
  );

  return ServicioHuesped;
}; 

