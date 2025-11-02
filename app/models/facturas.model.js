module.exports = (sequelize, Sequelize) => {
  const Factura = sequelize.define('facturas', {
    id_factura: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    numero_factura: { type: Sequelize.STRING, allowNull: false },
    nombre_cliente: { type: Sequelize.STRING, allowNull: false },
    correo_cliente: { type: Sequelize.STRING, allowNull: false },
    total: { type: Sequelize.FLOAT, allowNull: false },
    url_pdf: { type: Sequelize.STRING, allowNull: false },
    metodo_pago: { type: Sequelize.STRING, defaultValue: 'PayPal' },
    fecha_emision: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
  });

  return Factura;
};
