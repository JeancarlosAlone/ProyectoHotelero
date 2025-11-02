module.exports = (sequelize, DataTypes) => {
  const Pago = sequelize.define("pago", {
    id_pago: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    order_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    capture_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email_cliente: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nombre_cliente: {
      type: DataTypes.STRING,
      allowNull: false
    },
    monto: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    moneda: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fecha_pago: {
      type: DataTypes.DATE,
      allowNull: false
    }
  });

  return Pago;
};




