const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// GET /api/bookings - List bookings (query: ?status=upcoming|past|cancelled)
router.get('/', bookingController.getAll);

// POST /api/bookings - Create a new booking
router.post('/', bookingController.create);

// PATCH /api/bookings/:uid/cancel - Cancel a booking by UID
router.patch('/:uid/cancel', bookingController.cancel);

module.exports = router;
