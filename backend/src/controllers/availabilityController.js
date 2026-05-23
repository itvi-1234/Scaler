const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const DEFAULT_USER_ID = 1;

/**
 * Get all availability schedules for the default user, including slots.
 */
async function getAll(req, res, next) {
  try {
    const schedules = await prisma.availabilitySchedule.findMany({
      where: { userId: DEFAULT_USER_ID },
      include: {
        slots: {
          orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: schedules });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a specific availability schedule by ID, including slots.
 */
async function getById(req, res, next) {
  try {
    const { id } = req.params;

    const schedule = await prisma.availabilitySchedule.findUnique({
      where: { id: parseInt(id) },
      include: {
        slots: {
          orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        },
      },
    });

    if (!schedule) {
      const err = new Error('Schedule not found.');
      err.statusCode = 404;
      throw err;
    }

    res.json({ success: true, data: schedule });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new availability schedule with slots.
 * Accepts: { name, timezone, isDefault, slots: [{ dayOfWeek, startTime, endTime }] }
 */
async function create(req, res, next) {
  try {
    const { name, timezone, isDefault, slots } = req.body;

    if (!name) {
      const err = new Error('Schedule name is required.');
      err.statusCode = 400;
      throw err;
    }

    // If this schedule is set as default, unset any existing default
    if (isDefault) {
      await prisma.availabilitySchedule.updateMany({
        where: { userId: DEFAULT_USER_ID, isDefault: true },
        data: { isDefault: false },
      });
    }

    const schedule = await prisma.availabilitySchedule.create({
      data: {
        userId: DEFAULT_USER_ID,
        name,
        timezone: timezone || 'America/New_York',
        isDefault: isDefault || false,
        slots: {
          create: (slots || []).map((slot) => ({
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
          })),
        },
      },
      include: {
        slots: {
          orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        },
      },
    });

    res.status(201).json({ success: true, data: schedule });
  } catch (error) {
    next(error);
  }
}

/**
 * Update a schedule: replace all slots with new ones.
 * Accepts: { name, timezone, slots: [{ dayOfWeek, startTime, endTime }] }
 */
async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { name, timezone, isDefault, slots } = req.body;

    const existing = await prisma.availabilitySchedule.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing) {
      const err = new Error('Schedule not found.');
      err.statusCode = 404;
      throw err;
    }

    // If setting as default, unset any existing default
    if (isDefault) {
      await prisma.availabilitySchedule.updateMany({
        where: { userId: DEFAULT_USER_ID, isDefault: true, id: { not: parseInt(id) } },
        data: { isDefault: false },
      });
    }

    // Use a transaction to delete old slots and create new ones atomically
    const schedule = await prisma.$transaction(async (tx) => {
      // Delete existing slots
      await tx.availabilitySlot.deleteMany({
        where: { scheduleId: parseInt(id) },
      });

      // Update schedule and create new slots
      return tx.availabilitySchedule.update({
        where: { id: parseInt(id) },
        data: {
          ...(name !== undefined && { name }),
          ...(timezone !== undefined && { timezone }),
          ...(isDefault !== undefined && { isDefault }),
          slots: {
            create: (slots || []).map((slot) => ({
              dayOfWeek: slot.dayOfWeek,
              startTime: slot.startTime,
              endTime: slot.endTime,
            })),
          },
        },
        include: {
          slots: {
            orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
          },
        },
      });
    });

    res.json({ success: true, data: schedule });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
};
