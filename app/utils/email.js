const nodemailer = require("nodemailer");
const path = require("path");

async function enviarFacturaPorCorreo(destinatario, pdfPath, meta = {}) {
  const { nombre = "", total = 0, numeroFactura = "" } = meta;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("EMAIL_USER o EMAIL_PASS no definidos en .env");
    throw new Error("Credenciales de correo no configuradas");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const html = `
    <div style="font-family: Arial, sans-serif; color:#333">
      <h2>Factura ${numeroFactura}</h2>
      <p>Estimado/a <strong>${nombre || "cliente"}</strong>,</p>
      <p>Adjuntamos la factura de su reserva en <strong>Hotel DW</strong>.</p>
      <p><strong>Total pagado:</strong> Q ${Number(total).toFixed(2)}</p>
      <p>Gracias por su preferencia.</p>
      <hr/>
      <small>Este es un mensaje automático. No responder.</small>
    </div>
  `;

  const info = await transporter.sendMail({
    from: `"Hotel DW" <${process.env.EMAIL_USER}>`,
    to: destinatario,
    subject: `Factura ${numeroFactura} - Hotel DW`,
    html,
    attachments: [
      {
        filename: path.basename(pdfPath),
        path: pdfPath,
      },
    ],
  });

  console.log("Correo enviado a:", destinatario, "MessageId:", info.messageId);
}

module.exports = { enviarFacturaPorCorreo };
