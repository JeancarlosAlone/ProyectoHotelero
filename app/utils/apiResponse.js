// app/utils/apiResponse.js
module.exports = function ApiResponse(message, status, data = null) {
  return { message, status, data };
};

