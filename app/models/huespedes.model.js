module.exports = (sequelize, DataTypes) => {
  const Huespedes = sequelize.define("huespedes", {
    idHuesped: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    tipoRegistro: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'manual'
    },
    nameHuesped: {
      type: DataTypes.STRING,
      allowNull: false
    },
    apellidoHuesped: {
      type: DataTypes.STRING,
      allowNull: false
    },
    telefono: {
      type: DataTypes.STRING(8),
      allowNull: false,
      validate: {
        len: [8, 8] // exactamente 8 dígitos
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: { isEmail: true }
      },
    },
    numPersonas: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    monto: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    statusHuesped: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fechaRegistro: {
      type: DataTypes.DATE,
      allowNull: false
    },
    fechaSalida: {
      type: DataTypes.DATE,
      allowNull: false
    }

    // porque Sequelize los añadirá automáticamente por belongsTo
  }, {
    tableName: "huespedes",
    timestamps: false
  });

  // Relaciones (equivalente a @ManyToOne en Spring)
  Huespedes.associate = (models) => {
    Huespedes.belongsTo(models.usuarios, {
      foreignKey: "id_users",
      as: "usuarioRegistrador"
    });

    Huespedes.belongsTo(models.rooms, {
      foreignKey: "id_Rooms",
      as: "habitacionAsignada"
    });
  };

  return Huespedes;
};
