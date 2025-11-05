const db = require('../models');
const ServicioHuesped = db.servicio_huesped;

// ✅ Obtener todos los servicios de todos los huéspedes
exports.getAllServicios = async (req, res) => {
  try {
    const servicios = await ServicioHuesped.findAll();
    return res.status(200).json(servicios);
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    return res.status(500).json({ message: 'Error al obtener servicios', error: error.message });
  }
};

// ✅ Obtener servicios por idHuesped
exports.getServiciosByHuesped = async (req, res) => {
  try {
    const idHuesped = req.params.idHuesped;
    const servicios = await ServicioHuesped.findAll({ where: { idHuesped } });

    if (!servicios.length) {
      return res.status(404).json({ message: 'No se encontraron servicios para este huésped' });
    }

    return res.status(200).json(servicios);
  } catch (error) {
    console.error('Error al obtener servicios por huésped:', error);
    return res.status(500).json({ message: 'Error al obtener servicios', error: error.message });
  }
};

// ✅ Crear un servicio (opcional, por si quisieras registrar manualmente)
exports.createServicio = async (req, res) => {
  try {
    const nuevo = await ServicioHuesped.create(req.body);
    return res.status(201).json(nuevo);
  } catch (error) {
    console.error('Error al crear servicio:', error);
    return res.status(400).json({ message: 'Error al crear servicio', error: error.message });
  }
};

// ✅ Eliminar servicio (opcional)
exports.deleteServicio = async (req, res) => {
  try {
    const id = req.params.id;
    const rowsDeleted = await ServicioHuesped.destroy({ where: { id_servicio: id } });

    if (rowsDeleted === 0) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }

    return res.status(200).json({ message: 'Servicio eliminado', id });
  } catch (error) {
    console.error('Error al eliminar servicio:', error);
    return res.status(500).json({ message: 'Error al eliminar servicio', error: error.message });
  }
};
