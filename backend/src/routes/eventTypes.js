const express = require('express');
const router = express.Router();
const eventTypeController = require('../controllers/eventTypeController');

// GET /api/event-types - List all event types for default user
router.get('/', eventTypeController.getAll);

// POST /api/event-types - Create a new event type
router.post('/', eventTypeController.create);

// PUT /api/event-types/:id - Update an event type
router.put('/:id', eventTypeController.update);

// DELETE /api/event-types/:id - Delete an event type
router.delete('/:id', eventTypeController.delete);

// PATCH /api/event-types/:id/toggle - Toggle isActive status
router.patch('/:id/toggle', eventTypeController.toggle);

module.exports = router;
