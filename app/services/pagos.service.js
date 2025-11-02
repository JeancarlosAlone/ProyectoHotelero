const paypal = require("@paypal/checkout-server-sdk");

function environment() {
  return new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  );
}

function client() {
  return new paypal.core.PayPalHttpClient(environment());
}

module.exports = {
  client
};

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
  return response.result;
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

