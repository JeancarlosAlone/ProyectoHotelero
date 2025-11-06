const express = require('express');
const router = express.Router();
const roomsController = require('../controllers/rooms.controller');

// GET all
router.get('/', roomsController.getAll);

// GET disponibles
router.get('/disponibles', roomsController.getDisponibles);

// PATCH estado
router.patch('/:id/estado', roomsController.changeStatus);

// GET by id
router.get('/:id', roomsController.getById);

// POST create
router.post('/', roomsController.create);

// PUT update
router.put('/:id', roomsController.update);

// DELETE
router.delete('/:id', roomsController.delete);

// EXISTS
router.get('/:id/exists', roomsController.exists);

module.exports = router;
