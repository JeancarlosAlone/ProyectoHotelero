// app/models/clientes.model.js
module.exports = (sequelize, Sequelize) => {
  const Clientes = sequelize.define(
    'clientes',
    {
      id_cliente: {
        type: Sequelize.STRING(12),
        primaryKey: true,
        allowNull: false,
      },
      nombre: {
        type: Sequelize.STRING(120),
        allowNull: false,
      },
      apellido: {
        type: Sequelize.STRING(120),
        allowNull: false,
      },
      correo: {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      fecha_registro: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    },
    {
      tableName: 'clientes',
      timestamps: false,
      underscored: true,
    }
  );

  return Clientes;
};
