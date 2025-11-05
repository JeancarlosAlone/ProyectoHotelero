module.exports = (sequelize, DataTypes) => {
  const Rooms = sequelize.define(
    'Rooms',
    {
      id_Rooms: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      habitacion: {
        type: DataTypes.ENUM('normal', 'doble', 'plus'),
        allowNull: false,
      },
      nivel: {
        type: DataTypes.ENUM('N1', 'N2'),
        allowNull: false,
      },
      estado: {
        type: DataTypes.ENUM('ocupada', 'libre', 'limpieza'),
        allowNull: false,
      },
      precio: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      image_url: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: { isUrl: true },
      },
    },
    {
      schema: 'public',            
      tableName: 'Rooms',         
      freezeTableName: true,      
      timestamps: false,          
    }
  );

  return Rooms;
};
