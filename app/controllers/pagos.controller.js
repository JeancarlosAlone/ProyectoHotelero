const apiResponse = require("../utils/apiResponse");
const { crearOrden, capturarOrden } = require("../services/pagos.service");
const { generarFactura } = require("../controllers/facturas.controller.js");
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
    const { orderId, idHuesped } = req.body;
    if (!orderId) return res.status(400).json(apiResponse("orderId es requerido", "error"));

    const resultado = await capturarOrden(orderId);
    const capture = resultado.purchase_units?.[0]?.payments?.captures?.[0];
    const payer = resultado.payer;

    // Guardar el pago en BD
    const nuevoPago = await db.pagos.create({
      order_id: resultado.id,
      capture_id: capture?.id || "SIN_ID",
      estado: resultado.status,
      email_cliente: payer?.email_address || "desconocido",
      nombre_cliente: `${payer?.name?.given_name || ""} ${payer?.name?.surname || ""}`,
      monto: parseFloat(capture?.amount?.value || 0),
      moneda: capture?.amount?.currency_code || "USD",
      fecha_pago: new Date(capture?.create_time || new Date())
    });

    // Actualizar huésped
    const huesped = idHuesped ? await db.huespedes.findByPk(idHuesped) : null;
    if (huesped) {
      huesped.statusHuesped = "pagado";
      await huesped.save();
    }

    if (huesped) {
      try {
        await generarFactura({
          body: {
            cliente: {
              nombre: huesped.nameHuesped,
              apellido: huesped.apellidoHuesped,
              telefono: huesped.telefono,
              email: huesped.email,
              dpi: huesped.dpi || "",
            },
            habitacion: huesped.habitacionAsignada || {},
            serviciosSeleccionados: huesped.servicios || [],
            total: capture?.amount?.value,
            pago: "PayPal",
          },
        }, { 
          json: (data) => console.log("Factura generada:", data) 
        });
      } catch (err) {
        console.error("Error generando o enviando factura:", err);
      }
    }

    return res.status(200).json(apiResponse(
      "Pago capturado y factura enviada correctamente",
      "success",
      { resultado, nuevoPago }
    ));
  } catch (error) {
    console.error("Error al capturar el pago:", error);
    return res.status(500).json(apiResponse("Error al capturar el pago", "error"));
  }
};


// ======================== NUEVO ENDPOINT: REGISTRAR PAGO ========================
const registrarPago = async (req, res) => {
  try {
    const { idHuesped, monto, metodoPago, estado } = req.body;

    if (!idHuesped || !monto) {
      return res
        .status(400)
        .json(apiResponse("Datos incompletos para registrar el pago", "error"));
    }

    const nuevoPago = await db.pagos.create({
      order_id: `MANUAL-${Date.now()}`, // identificador interno
      capture_id: "SIN_ID",
      estado: estado || "completado",
      email_cliente: "registro-manual@sistema.com",
      nombre_cliente: "Pago posterior (administrativo)",
      monto: parseFloat(monto),
      moneda: "USD",
      metodo_pago: metodoPago || "PayPal",
      fecha_pago: new Date()
    });

    const huesped = await db.huespedes.findByPk(idHuesped);
    if (huesped) {
      huesped.statusHuesped = "pagado";
      await huesped.save();
    }

    return res.status(201).json(
      apiResponse("Pago registrado correctamente", "success", {
        nuevoPago,
        huespedActualizado: huesped ? huesped.idHuesped : null
      })
    );
  } catch (error) {
    console.error("Error al registrar pago:", error);
    return res
      .status(500)
      .json(apiResponse("Error al registrar el pago", "error", error.message));
  }
};



module.exports = {
  crearOrdenPago,
  capturarPago, 
  registrarPago
};



