const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET /api/users/:username - Get user profile with active event types
router.get('/:username', userController.getByUsername);

// GET /api/users/:username/:slug - Get specific event type by username + slug
router.get('/:username/:slug', userController.getEventType);

// GET /api/users/:username/:slug/slots - Get available time slots for a date
router.get('/:username/:slug/slots', userController.getAvailableSlots);

module.exports = router;
