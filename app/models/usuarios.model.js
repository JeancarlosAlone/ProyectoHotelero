// app/models/usuarios.model.js
module.exports = (sequelize, Sequelize) => {
  const Usuarios = sequelize.define('usuarios', {
    id_users: {
      type: Sequelize.STRING(12), 
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: Sequelize.STRING(120),
      allowNull: true,
    },
    apellido: {
      type: Sequelize.STRING(120),
      allowNull: true,
    },
    // Foto en base64 (columna real: imagen_base64)
    imagenBase64: {
      type: Sequelize.TEXT('long'),
      allowNull: true,
      field: 'imagen_base64',
    },
    password: {
      type: Sequelize.STRING(255),
      allowNull: true,
      validate: {
        // al menos 1 mayúscula y 1 símbolo
        is: /^(?=.*[A-Z])(?=.*[\W_]).*$/i,
      },
    },
    typeUser: {
      type: Sequelize.ENUM('admin', 'user'),
      allowNull: true,
      field: 'type_user',
    },
    fechaIngreso: {
      type: Sequelize.DATEONLY,
      allowNull: false,
      field: 'fecha_ingreso',
    },
  }, {
    tableName: 'usuarios',
    timestamps: true,
    underscored: true,
  });

  return Usuarios;
};
