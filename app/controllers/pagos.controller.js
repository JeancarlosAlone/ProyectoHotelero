  const apiResponse = require("../utils/apiResponse");
  const { crearOrden, capturarOrden } = require("../services/pagos.service");
  const { generarFactura } = require("../controllers/facturas.controller.js");
  const db = require("../models");

  const crearOrdenPago = async (req, res) => {
    try {
      const { total, currency } = req.body;

      if (!total) {
        return res
          .status(400)
          .json(apiResponse("Total es requerido", "error"));
      }

      // Llamada al servicio de creación de la orden
      const orderId = await crearOrden(total, currency || 'USD');

      return res
        .status(201)
        .json(apiResponse("Orden creada correctamente", "success", { id: orderId }));  // Aquí devolvemos el ID de la orden
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
    if (!orderId) {
      return res.status(400).json(apiResponse("orderId es requerido", "error"));
    }

    // Captura de la orden
    const resultado = await capturarOrden(orderId);
    const capture = resultado.purchase_units?.[0]?.payments?.captures?.[0];
    const payer = resultado.payer;

    const montoUSD = Number(capture?.amount?.value) || Number(req.body.total) || 0;
    const moneda = capture?.amount?.currency_code || "USD";
    const fechaPago = new Date(capture?.create_time || new Date());

    console.log("Monto recibido:", montoUSD, " | Captura:", capture?.amount);

    // 1️⃣ Registrar el pago en la base de datos
    const nuevoPago = await db.pagos.create({
      order_id: resultado.id,
      capture_id: capture?.id || "SIN_ID",
      estado: resultado.status,
      email_cliente: payer?.email_address || "desconocido",
      nombre_cliente: `${payer?.name?.given_name || ""} ${payer?.name?.surname || ""}`,
      monto: parseFloat(montoUSD.toFixed(2)),
      moneda,
      fecha_pago: fechaPago,
      metodo_pago: "PayPal"
    });

    console.log("💾 Nuevo pago registrado en BD:", nuevoPago.id_pago);

    // 2️⃣ Buscar el huésped y actualizar su estado a "pagado"
    let huesped = null;
    if (idHuesped) {
      huesped = await db.huespedes.findByPk(idHuesped);
      if (huesped) {
        huesped.statusHuesped = "pagado";
        huesped.monto = montoUSD;
        await huesped.save();

        // Si tiene habitación asignada, marcarla como ocupada
        if (huesped.habitacionAsignada) {
          const habitacion = await db.Rooms.findByPk(huesped.habitacionAsignada);
          if (habitacion) {
            habitacion.estado = "ocupada";
            await habitacion.save();
            console.log(`🛏️ Habitación ${habitacion.habitacion} marcada como ocupada.`);
          }
        }
      }
    }

    // 3️⃣ Generar la factura solo si el huésped existe
    let facturaGenerada = null;
    if (huesped) {
      try {
        facturaGenerada = await new Promise((resolve, reject) => {
          generarFactura(
            {
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
                total: montoUSD,
                pago: "PayPal (USD)"
              },
            },
            { json: resolve } // Recibe la respuesta de generarFactura
          );
        });

        console.log("✅ Factura generada y enviada:", facturaGenerada);
      } catch (err) {
        console.error("❌ Error generando o enviando factura:", err);
      }
    }

    // 4️⃣ Respuesta final al frontend
    return res.status(200).json(
      apiResponse("Pago completado y factura enviada correctamente", "success", {
        resultado,
        nuevoPago,
        facturaGenerada,
      })
    );
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



