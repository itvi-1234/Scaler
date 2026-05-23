const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

/**
 * Get all bookings with filters.
 * Query param: status = upcoming | past | cancelled | all (default: all)
 * - upcoming: startTime > now AND status != CANCELLED
 * - past: startTime <= now OR status == COMPLETED (but not CANCELLED)
 * - cancelled: status == CANCELLED
 * Includes eventType info. Ordered by startTime.
 */
async function getAll(req, res, next) {
  try {
    const { status } = req.query;
    const now = new Date();
    let where = {};

    switch (status) {
      case 'upcoming':
        where = {
          startTime: { gt: now },
          status: { not: 'CANCELLED' },
        };
        break;
      case 'past':
        where = {
          OR: [
            { startTime: { lte: now }, status: { not: 'CANCELLED' } },
            { status: 'COMPLETED' },
          ],
        };
        break;
      case 'cancelled':
        where = { status: 'CANCELLED' };
        break;
      default:
        // Return all bookings
        break;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        eventType: {
          include: {
            user: {
              select: { id: true, name: true, username: true, email: true },
            },
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    res.json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new booking.
 * Validates no overlapping bookings for the same event type at that time.
 * Accepts: { eventTypeId, bookerName, bookerEmail, bookerNotes, startTime, timezone }
 * Calculates endTime from the event type's duration.
 */
async function create(req, res, next) {
  try {
    const { eventTypeId, bookerName, bookerEmail, bookerNotes, startTime, timezone } = req.body;

    // Validate required fields
    if (!eventTypeId || !bookerName || !bookerEmail || !startTime) {
      const err = new Error('eventTypeId, bookerName, bookerEmail, and startTime are required.');
      err.statusCode = 400;
      throw err;
    }

    // Find the event type to get the duration
    const eventType = await prisma.eventType.findUnique({
      where: { id: parseInt(eventTypeId) },
    });

    if (!eventType) {
      const err = new Error('Event type not found.');
      err.statusCode = 404;
      throw err;
    }

    if (!eventType.isActive) {
      const err = new Error('This event type is currently not available for booking.');
      err.statusCode = 400;
      throw err;
    }

    // Calculate endTime from event type duration
    const bookingStart = new Date(startTime);
    const bookingEnd = new Date(bookingStart.getTime() + eventType.durationMinutes * 60 * 1000);

    // Check for overlapping bookings on this event type
    const overlapping = await prisma.booking.findFirst({
      where: {
        eventTypeId: parseInt(eventTypeId),
        status: { not: 'CANCELLED' },
        // Overlap condition: existing.start < new.end AND existing.end > new.start
        startTime: { lt: bookingEnd },
        endTime: { gt: bookingStart },
      },
    });

    if (overlapping) {
      const err = new Error('This time slot is already booked. Please choose a different time.');
      err.statusCode = 409;
      throw err;
    }

    const booking = await prisma.booking.create({
      data: {
        eventTypeId: parseInt(eventTypeId),
        bookerName,
        bookerEmail,
        bookerNotes: bookerNotes || null,
        startTime: bookingStart,
        endTime: bookingEnd,
        status: 'UPCOMING',
        timezone: timezone || 'America/New_York',
        uid: uuidv4(),
      },
      include: {
        eventType: {
          include: {
            user: {
              select: { id: true, name: true, username: true, email: true },
            },
          },
        },
      },
    });

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
}

/**
 * Cancel a booking by UID.
 * Sets status to 'CANCELLED'.
 */
async function cancel(req, res, next) {
  try {
    const { uid } = req.params;

    const existing = await prisma.booking.findUnique({ where: { uid } });
    if (!existing) {
      const err = new Error('Booking not found.');
      err.statusCode = 404;
      throw err;
    }

    if (existing.status === 'CANCELLED') {
      const err = new Error('Booking is already cancelled.');
      err.statusCode = 400;
      throw err;
    }

    const booking = await prisma.booking.update({
      where: { uid },
      data: { status: 'CANCELLED' },
      include: {
        eventType: {
          include: {
            user: {
              select: { id: true, name: true, username: true, email: true },
            },
          },
        },
      },
    });

    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAll,
  create,
  cancel,
};
