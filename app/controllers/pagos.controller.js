const apiResponse = require("../utils/apiResponse");
const { crearOrden, capturarOrden } = require("../services/pagos.service");
const db = require("../models");

const crearOrdenPago = async (req, res) => {
  try {
    const { total } = req.body;

    if (!total) {
      return res
        .status(400)
        .json(apiResponse("Total es requerido", "error"));
    }

    const orden = await crearOrden(total);
    return res
      .status(201)
      .json(apiResponse("Orden creada correctamente", "success", orden));
  } catch (error) {
    console.error("Error al crear la orden:", error);
    return res
      .status(500)
      .json(apiResponse("Error al crear la orden", "error"));
  }
};

const capturarPago = async (req, res) => {
  try {
    const { orderId, idHuesped } = req.body; // 👈 añadimos idHuesped

    if (!orderId) {
      return res
        .status(400)
        .json(apiResponse("orderId es requerido", "error"));
    }

    const resultado = await capturarOrden(orderId);

    // Destructuramos los datos para guardar en la base de datos
    const capture = resultado.purchase_units?.[0]?.payments?.captures?.[0];
    const payer = resultado.payer;
    const payment_source = resultado.payment_source?.paypal;

    // 1️⃣ Guardamos el pago
    const nuevoPago = await db.pagos.create({
      order_id: resultado.id,
      capture_id: capture?.id || "SIN_ID",
      estado: resultado.status,
      email_cliente: payment_source?.email_address || payer?.email_address || "desconocido",
      nombre_cliente: `${payment_source?.name?.given_name || payer?.name?.given_name || ""} ${payment_source?.name?.surname || payer?.name?.surname || ""}`,
      monto: parseFloat(capture?.amount?.value || 0),
      moneda: capture?.amount?.currency_code || "USD",
      fecha_pago: new Date(capture?.create_time || new Date())
    });

    // Si el pago se capturó correctamente, actualizamos el huésped
    if (idHuesped && resultado.status === "COMPLETED") {
      const huesped = await db.huespedes.findByPk(idHuesped);

      if (huesped) {
        huesped.statusHuesped = "cancelado";
        await huesped.save();
        console.log(`✅ Estado de huésped ${idHuesped} actualizado a cancelado`);
      } else {
        console.warn(`⚠️ No se encontró huésped con ID ${idHuesped}`);
      }
    }

    return res
      .status(200)
      .json(apiResponse("Pago capturado y huésped actualizado correctamente", "success", {
        resultado,
        nuevoPago
      }));

  } catch (error) {
    console.error("Error al capturar el pago:", error);
    return res
      .status(500)
      .json(apiResponse("Error al capturar el pago", "error"));
  }
};


module.exports = {
  crearOrdenPago,
  capturarPago
};

