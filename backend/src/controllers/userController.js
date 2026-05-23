const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Get user profile by username, including active event types.
 */
async function getByUsername(req, res, next) {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        eventTypes: {
          where: { isActive: true },
          orderBy: { durationMinutes: 'asc' },
        },
      },
    });

    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a specific event type by username + slug.
 * Includes user info.
 */
async function getEventType(req, res, next) {
  try {
    const { username, slug } = req.params;

    // First find the user
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }

    const eventType = await prisma.eventType.findFirst({
      where: {
        slug,
        userId: user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            timezone: true,
            avatarUrl: true,
            bio: true,
          },
        },
        schedule: {
          include: { slots: true },
        },
      },
    });

    if (!eventType) {
      const err = new Error('Event type not found.');
      err.statusCode = 404;
      throw err;
    }

    res.json({ success: true, data: eventType });
  } catch (error) {
    next(error);
  }
}

/**
 * Get available time slots for a specific date.
 * Route: GET /api/users/:username/:slug/slots?date=YYYY-MM-DD&timezone=America/New_York
 *
 * Logic:
 * 1. Find the event type's schedule (or fall back to user's default schedule)
 * 2. Get the dayOfWeek for the requested date
 * 3. Get availability slots for that day
 * 4. Generate all possible time slots based on event duration
 * 5. Filter out slots that overlap with existing bookings on that date
 * 6. Return available slots as array of { time: "09:00" } objects
 */
async function getAvailableSlots(req, res, next) {
  try {
    const { username, slug } = req.params;
    const { date, timezone } = req.query;

    if (!date) {
      const err = new Error('Date query parameter is required (YYYY-MM-DD).');
      err.statusCode = 400;
      throw err;
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      const err = new Error('Invalid date format. Use YYYY-MM-DD.');
      err.statusCode = 400;
      throw err;
    }

    // Find the user
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }

    // Find the event type
    const eventType = await prisma.eventType.findFirst({
      where: { slug, userId: user.id },
    });
    if (!eventType) {
      const err = new Error('Event type not found.');
      err.statusCode = 404;
      throw err;
    }

    // Get the schedule - either event type's schedule or user's default schedule
    let schedule;
    if (eventType.scheduleId) {
      schedule = await prisma.availabilitySchedule.findUnique({
        where: { id: eventType.scheduleId },
        include: { slots: true },
      });
    }

    if (!schedule) {
      schedule = await prisma.availabilitySchedule.findFirst({
        where: { userId: user.id, isDefault: true },
        include: { slots: true },
      });
    }

    if (!schedule) {
      return res.json({ success: true, data: [] });
    }

    // Determine the day of week for the requested date
    // Parse the date as a local date in the schedule's timezone
    const requestedDate = new Date(date + 'T00:00:00');
    const dayOfWeek = requestedDate.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday

    // Get availability slots for this day of the week
    const daySlots = schedule.slots.filter((slot) => slot.dayOfWeek === dayOfWeek);

    if (daySlots.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // Generate all possible time slots based on event duration
    const possibleSlots = [];
    const durationMinutes = eventType.durationMinutes;

    for (const daySlot of daySlots) {
      const [startHour, startMinute] = daySlot.startTime.split(':').map(Number);
      const [endHour, endMinute] = daySlot.endTime.split(':').map(Number);

      const slotStartMinutes = startHour * 60 + startMinute;
      const slotEndMinutes = endHour * 60 + endMinute;

      // Generate slots at intervals equal to the event duration
      for (let time = slotStartMinutes; time + durationMinutes <= slotEndMinutes; time += durationMinutes) {
        const hours = Math.floor(time / 60);
        const minutes = time % 60;
        const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        possibleSlots.push(timeStr);
      }
    }

    // Get existing bookings for this date and event type
    // We need to check bookings on the requested date
    const dayStart = new Date(date + 'T00:00:00.000Z');
    const dayEnd = new Date(date + 'T23:59:59.999Z');

    const existingBookings = await prisma.booking.findMany({
      where: {
        eventTypeId: eventType.id,
        status: { not: 'CANCELLED' },
        startTime: { gte: dayStart, lte: dayEnd },
      },
    });

    // Filter out slots that overlap with existing bookings
    const availableSlots = possibleSlots.filter((timeStr) => {
      const [hour, minute] = timeStr.split(':').map(Number);

      // Create slot start and end times for comparison
      const slotStart = new Date(date + 'T00:00:00.000Z');
      slotStart.setUTCHours(hour, minute, 0, 0);

      const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);

      // Check if this slot overlaps with any existing booking
      const hasOverlap = existingBookings.some((booking) => {
        const bookingStart = new Date(booking.startTime);
        const bookingEnd = new Date(booking.endTime);
        // Overlap: slotStart < bookingEnd AND slotEnd > bookingStart
        return slotStart < bookingEnd && slotEnd > bookingStart;
      });

      return !hasOverlap;
    });

    // Return as array of { time: "09:00" } objects
    const result = availableSlots.map((time) => ({ time }));

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getByUsername,
  getEventType,
  getAvailableSlots,
};
