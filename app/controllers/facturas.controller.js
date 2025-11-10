const nodemailer = require("nodemailer");
const path = require("path");
const db = require("../models");
const Factura = db.facturas;
const PDFDocument = require("pdfkit");
const fs = require("fs");
const QRCode = require("qrcode");

const generarFactura = async (req, res = null) => {
  try {
    const { cliente, habitacion, serviciosSeleccionados, total, pago } = req.body;

    const numeroFactura = `FAC-${Date.now()}`;
    const fechaEmision = new Date().toLocaleString();
    const facturasDir = path.join(__dirname, "../../facturas");

    if (!fs.existsSync(facturasDir)) fs.mkdirSync(facturasDir, { recursive: true });

    const facturaPath = path.join(facturasDir, `${numeroFactura}.pdf`);
    const qrData = `https://hoteldw.com/checkin/${numeroFactura}`;
    const qrImage = await QRCode.toDataURL(qrData);

    // 🧾 Crear PDF
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const writeStream = fs.createWriteStream(facturaPath);
    doc.pipe(writeStream);

    // ======= ENCABEZADO =======
    const beige = "#FFFDF5";
    const dorado = "#FFD700";
    const doradoOscuro = "#A67C00";
    const negro = "#000000";
    doc.rect(0, 0, 600, 800).fill(beige);
    doc.rect(0, 0, 600, 90).fillColor(doradoOscuro).fill();

    const logoPath = path.join(__dirname, "../../public/assets/images/LosMolinos.jpeg");
    if (fs.existsSync(logoPath)) doc.image(logoPath, 50, 25, { width: 60 });

    doc
      .fillColor(beige)
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("HOTEL OLYMPUS", 130, 30)
      .fontSize(10)
      .font("Helvetica")
      .text("Confort y elegancia a su servicio", 130, 55)
      .font("Helvetica-Oblique")
      .text("Tel: +502 5555-5555 | info@hoteldw.com", 130, 70);

    // ======= DATOS FACTURA =======
    doc.fillColor(doradoOscuro).fontSize(14).font("Helvetica-Bold").text("Factura de Reserva", 50, 110);
    doc.strokeColor(dorado).lineWidth(1.5).moveTo(50, 130).lineTo(550, 130).stroke();

    doc.fontSize(11).font("Helvetica").fillColor(negro)
      .text(`Factura No.: ${numeroFactura}`, 50, 145)
      .text(`Fecha de emisión: ${fechaEmision}`, 50, 160);

    // ======= CLIENTE =======
    doc.fillColor(doradoOscuro).font("Helvetica-Bold").fontSize(13).text("Datos del Cliente", 50, 190);
    doc.font("Helvetica").fillColor(negro).fontSize(11)
      .text(`Nombre: ${cliente?.nombre || ""} ${cliente?.apellido || ""}`)
      .text(`DPI: ${cliente?.dpi || ""}`)
      .text(`Teléfono: ${cliente?.telefono || ""}`)
      .text(`Correo electrónico: ${cliente?.email || ""}`);

    // ======= CÁLCULOS =======
    const noches = cliente?.nochesEstancia || 1;
    const totalHabitacion = (habitacion?.precio || 0) * noches;
    const totalServicios = serviciosSeleccionados?.reduce((acc, s) => acc + (s.precioFinal || s.precio || 0), 0);
    const totalFinal = totalHabitacion + totalServicios;

    // ======= HABITACIÓN =======
    doc.moveDown().fillColor(doradoOscuro).font("Helvetica-Bold").fontSize(13).text("Detalle de la Habitación", 50);
    doc.font("Helvetica").fillColor(negro).text(`Habitación: ${habitacion?.habitacion || ""}`)
      .text(`Nivel: ${habitacion?.nivel || ""}`)
      .text(`Precio total por noche: Q ${totalHabitacion.toFixed(2)}`);

    // ======= SERVICIOS =======
    doc.moveDown().fillColor(doradoOscuro).font("Helvetica-Bold").fontSize(13).text("Servicios Adicionales", 50);
    if (serviciosSeleccionados?.length > 0) {
      doc.font("Helvetica").fillColor(negro).fontSize(11);
      serviciosSeleccionados.forEach((s) => doc.text(`• ${s.nombre} — Q ${s.precioFinal || s.precio}`));
    } else {
      doc.font("Helvetica").fillColor(negro).fontSize(11).text("Sin servicios adicionales seleccionados.");
    }

    // ======= TOTAL =======
    doc.moveDown().font("Helvetica-Bold").fillColor(doradoOscuro).fontSize(13)
      .text("Resumen del Pago", 50)
      .strokeColor(dorado).moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke()
      .font("Helvetica").fillColor(negro).fontSize(12)
      .text(`Método de pago: ${pago || "PayPal"}`)
      .text(`Total pagado: Q ${totalFinal.toFixed(2)}`);

    // ======= QR =======
    const qrX = 420;
    const qrY = doc.y - 10;
    doc.image(qrImage, qrX, qrY, { width: 100 });
    doc.fontSize(9).fillColor(doradoOscuro).text("Escanee para confirmar Check-in", qrX, qrY + 105, { width: 120 });

    doc.end();

    // ======= Esperar finalización =======
    writeStream.on("finish", async () => {
      const fileUrl = `http://localhost:8080/facturas/${numeroFactura}.pdf`;

      try {
        // 📧 Envío de correo
        if (cliente?.email) {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          });

          const mailOptions = {
            from: `"Hotel DW" <${process.env.EMAIL_USER}>`,
            to: cliente.email,
            subject: `Factura ${numeroFactura} - Hotel DW`,
            text: `Estimado ${cliente.nombre}, adjuntamos su factura correspondiente a su reserva.`,
            attachments: [{ filename: `${numeroFactura}.pdf`, path: facturaPath }],
          };

          await transporter.sendMail(mailOptions);
          console.log(`✅ Factura enviada a ${cliente.email}`);
        }

        // 🗂️ Guardar factura en BD
        await Factura.create({
          numero_factura: numeroFactura,
          nombre_cliente: `${cliente?.nombre || ""} ${cliente?.apellido || ""}`.trim(),
          correo_cliente: cliente?.email || "",
          total: Number(totalFinal) || 0,
          url_pdf: fileUrl,
          metodo_pago: pago || "PayPal",
        });
        console.log("🗂️ Factura registrada en BD:", numeroFactura);

        if (res) {
          return res.json({
            ok: true,
            url: fileUrl,
            mensaje: "Factura generada y enviada correctamente",
          });
        }
      } catch (e) {
        console.error("❌ Error durante el proceso de factura:", e);
        if (res) return res.status(500).json({ ok: false, error: e.message });
      }
    });
  } catch (error) {
    console.error("❌ Error generando factura:", error);
    if (res) return res.status(500).json({ ok: false, error: "Error generando factura" });
  }
};


const listarFacturas = async (req, res) => {
  try {
    const facturas = await Factura.findAll({
      order: [["fecha_emision", "DESC"]],
      attributes: [
        "id_factura",
        "numero_factura",
        "nombre_cliente",
        "correo_cliente",
        "total",
        "metodo_pago",
        "url_pdf",
        "fecha_emision",
      ],
    });
    res.json({ ok: true, data: facturas });
  } catch (err) {
    console.error("Error listando facturas:", err);
    res.status(500).json({ ok: false, error: "Error listando facturas" });
  }
};

module.exports = { generarFactura, listarFacturas };
