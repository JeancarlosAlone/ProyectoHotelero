const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt.config");

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // "Bearer <token>"
  if (!token) {
    return res.status(403).json({ message: "No se proporcionó un token" });
  }

  jwt.verify(token, jwtConfig.secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token inválido o expirado" });
    }
    req.user = decoded; // aquí guardamos los datos del usuario
    next();
  });
};

module.exports = { verifyToken };
