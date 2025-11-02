// app/models/rooms.model.js
module.exports = (sequelize, DataTypes) => {
  const Rooms = sequelize.define(
    'rooms',
    {
      id_Rooms: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      habitacion: {
        // types.typesRooms { normal, doble, plus }
        type: DataTypes.ENUM('normal', 'doble', 'plus'),
        allowNull: false,
      },
      nivel: {
        // types.typesRooms_level { N1, N2 }
        type: DataTypes.ENUM('N1', 'N2'),
        allowNull: false,
      },
      estado: {
        // types.typesRooms_Status { ocupada, libre, limpieza }
        type: DataTypes.ENUM('ocupada', 'libre', 'limpieza'),
        allowNull: false,
      },
      precio: {
        type: DataTypes.DOUBLE, // equivalente a Double en Java
        allowNull: false,
      },
    },
    {
      tableName: 'Rooms',     // usa exactamente este nombre de tabla
      freezeTableName: true,  // evita pluralización automática
      timestamps: false,      // tu entidad no maneja createdAt/updatedAt
    }
  );

  return Rooms;
};
