require('dotenv').config();
const paypal = require("@paypal/checkout-server-sdk");

function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    // Provide a clear error so it's visible in logs instead of the opaque PayPal "invalid_client"
    throw new Error('PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET must be set in environment variables');
  }

  // Allow switching between sandbox and live using PAYPAL_ENV (values: 'sandbox' or 'live')
  const useLive = (process.env.PAYPAL_ENV === 'sandbox' || process.env.NODE_ENV === 'production');

  return useLive
    ? new paypal.core.LiveEnvironment(clientId, clientSecret)
    : new paypal.core.SandboxEnvironment(clientId, clientSecret);
}

function client() {
  return new paypal.core.PayPalHttpClient(environment());
}

async function crearOrden(total, moneda = "USD") {
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: moneda,
          value: total.toString(),
        },
      },
    ],
  });

  const response = await client().execute(request);
  // Asegúrate de devolver la respuesta con el id
  if (response && response.result && response.result.id) {
    return response.result.id;  // Esto es lo que se necesita enviar al frontend
  } else {
    console.error("No se ha recibido un ID válido de la orden.");
    throw new Error("Error al crear la orden");
  }
}


async function capturarOrden(orderId) {
  const request = new paypal.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});

  const response = await client().execute(request);
  return response.result;
}

module.exports = {
  client,
  crearOrden,
  capturarOrden
};

