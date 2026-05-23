const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const DEFAULT_USER_ID = 1;

/**
 * Get all event types for the default user.
 * Includes associated schedule info.
 */
async function getAll(req, res, next) {
  try {
    const eventTypes = await prisma.eventType.findMany({
      where: { userId: DEFAULT_USER_ID },
      include: {
        schedule: {
          include: { slots: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: eventTypes });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new event type.
 * Auto-generates slug from title if not provided.
 * Validates slug uniqueness.
 */
async function create(req, res, next) {
  try {
    const { title, description, durationMinutes, location, color, isActive, scheduleId } = req.body;

    if (!title || !durationMinutes) {
      const err = new Error('Title and durationMinutes are required.');
      err.statusCode = 400;
      throw err;
    }

    // Auto-generate slug from title if not provided
    let slug = req.body.slug;
    if (!slug) {
      slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }

    // Check slug uniqueness
    const existing = await prisma.eventType.findUnique({ where: { slug } });
    if (existing) {
      const err = new Error(`An event type with slug "${slug}" already exists.`);
      err.statusCode = 409;
      throw err;
    }

    const eventType = await prisma.eventType.create({
      data: {
        userId: DEFAULT_USER_ID,
        title,
        slug,
        description: description || null,
        durationMinutes,
        location: location || 'Google Meet',
        color: color || '#111827',
        isActive: isActive !== undefined ? isActive : true,
        scheduleId: scheduleId || null,
      },
      include: {
        schedule: { include: { slots: true } },
      },
    });

    res.status(201).json({ success: true, data: eventType });
  } catch (error) {
    next(error);
  }
}

/**
 * Update an event type by ID.
 */
async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { title, slug, description, durationMinutes, location, color, isActive, scheduleId } = req.body;

    // Check the event type exists
    const existing = await prisma.eventType.findUnique({ where: { id: parseInt(id) } });
    if (!existing) {
      const err = new Error('Event type not found.');
      err.statusCode = 404;
      throw err;
    }

    // If slug is being changed, check uniqueness
    if (slug && slug !== existing.slug) {
      const slugTaken = await prisma.eventType.findUnique({ where: { slug } });
      if (slugTaken) {
        const err = new Error(`An event type with slug "${slug}" already exists.`);
        err.statusCode = 409;
        throw err;
      }
    }

    const eventType = await prisma.eventType.update({
      where: { id: parseInt(id) },
      data: {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(durationMinutes !== undefined && { durationMinutes }),
        ...(location !== undefined && { location }),
        ...(color !== undefined && { color }),
        ...(isActive !== undefined && { isActive }),
        ...(scheduleId !== undefined && { scheduleId }),
      },
      include: {
        schedule: { include: { slots: true } },
      },
    });

    res.json({ success: true, data: eventType });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete an event type by ID.
 */
async function deleteEventType(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await prisma.eventType.findUnique({ where: { id: parseInt(id) } });
    if (!existing) {
      const err = new Error('Event type not found.');
      err.statusCode = 404;
      throw err;
    }

    await prisma.eventType.delete({ where: { id: parseInt(id) } });

    res.json({ success: true, message: 'Event type deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

/**
 * Toggle the isActive status of an event type.
 */
async function toggle(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await prisma.eventType.findUnique({ where: { id: parseInt(id) } });
    if (!existing) {
      const err = new Error('Event type not found.');
      err.statusCode = 404;
      throw err;
    }

    const eventType = await prisma.eventType.update({
      where: { id: parseInt(id) },
      data: { isActive: !existing.isActive },
      include: {
        schedule: { include: { slots: true } },
      },
    });

    res.json({ success: true, data: eventType });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAll,
  create,
  update,
  delete: deleteEventType,
  toggle,
};
