const express = require('express');
const router = express.Router();

// Ruta de prueba
router.get('/hello', (req, res) => {
  res.json({ message: 'Hola desde /api/hello' });
});

module.exports = router;
