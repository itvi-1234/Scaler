const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availabilityController');

// GET /api/availability - List all schedules
router.get('/', availabilityController.getAll);

// GET /api/availability/:id - Get a specific schedule
router.get('/:id', availabilityController.getById);

// POST /api/availability - Create a new schedule
router.post('/', availabilityController.create);

// PUT /api/availability/:id - Update a schedule (replaces slots)
router.put('/:id', availabilityController.update);

module.exports = router;
