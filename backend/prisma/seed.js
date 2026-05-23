const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.booking.deleteMany();
  await prisma.availabilitySlot.deleteMany();
  await prisma.eventType.deleteMany();
  await prisma.availabilitySchedule.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create default user
  const user = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      username: 'john-doe',
      timezone: 'America/New_York',
      bio: 'Full-stack developer passionate about building great products.',
    },
  });
  console.log(`✅ Created user: ${user.name}`);

  // 2. Create default availability schedule (Mon-Fri, 9:00-17:00)
  const schedule = await prisma.availabilitySchedule.create({
    data: {
      userId: user.id,
      name: 'Working Hours',
      timezone: 'America/New_York',
      isDefault: true,
      slots: {
        create: [
          { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }, // Monday
          { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' }, // Tuesday
          { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' }, // Wednesday
          { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' }, // Thursday
          { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' }, // Friday
        ],
      },
    },
  });
  console.log(`✅ Created schedule: ${schedule.name}`);

  // 3. Create event types
  const eventType30Min = await prisma.eventType.create({
    data: {
      userId: user.id,
      title: '30 Min Meeting',
      slug: '30-min-meeting',
      description: 'A standard 30-minute meeting to discuss any topic.',
      durationMinutes: 30,
      location: 'Google Meet',
      color: '#2563eb',
      isActive: true,
      scheduleId: schedule.id,
    },
  });

  const eventTypeQuickChat = await prisma.eventType.create({
    data: {
      userId: user.id,
      title: 'Quick Chat',
      slug: 'quick-chat',
      description: 'A brief 15-minute chat for quick questions or introductions.',
      durationMinutes: 15,
      location: 'Google Meet',
      color: '#10b981',
      isActive: true,
      scheduleId: schedule.id,
    },
  });

  const eventTypeDeepDive = await prisma.eventType.create({
    data: {
      userId: user.id,
      title: 'Deep Dive',
      slug: 'deep-dive',
      description: 'An in-depth 60-minute session for detailed discussions and problem solving.',
      durationMinutes: 60,
      location: 'Google Meet',
      color: '#8b5cf6',
      isActive: true,
      scheduleId: schedule.id,
    },
  });

  console.log('✅ Created 3 event types');

  // 4. Create sample bookings
  const now = new Date();

  // Helper: create a date at a specific hour on a day offset from now
  function createDate(dayOffset, hour, minute) {
    const date = new Date(now);
    date.setDate(date.getDate() + dayOffset);
    date.setHours(hour, minute, 0, 0);
    return date;
  }

  // Upcoming booking 1: 3 days from now at 10:00 AM
  await prisma.booking.create({
    data: {
      eventTypeId: eventType30Min.id,
      bookerName: 'Alice Thompson',
      bookerEmail: 'alice.thompson@gmail.com',
      bookerNotes: 'Would love to discuss the new project proposal.',
      startTime: createDate(3, 10, 0),
      endTime: createDate(3, 10, 30),
      status: 'UPCOMING',
      timezone: 'America/New_York',
      uid: uuidv4(),
    },
  });

  // Upcoming booking 2: 5 days from now at 2:00 PM
  await prisma.booking.create({
    data: {
      eventTypeId: eventTypeDeepDive.id,
      bookerName: 'Marcus Rivera',
      bookerEmail: 'marcus.rivera@company.io',
      bookerNotes: 'Deep dive into the system architecture and scaling plans.',
      startTime: createDate(5, 14, 0),
      endTime: createDate(5, 15, 0),
      status: 'UPCOMING',
      timezone: 'America/Chicago',
      uid: uuidv4(),
    },
  });

  // Past booking 1: 5 days ago at 11:00 AM
  await prisma.booking.create({
    data: {
      eventTypeId: eventType30Min.id,
      bookerName: 'Sarah Chen',
      bookerEmail: 'sarah.chen@startup.co',
      bookerNotes: 'Follow-up on the partnership opportunity.',
      startTime: createDate(-5, 11, 0),
      endTime: createDate(-5, 11, 30),
      status: 'COMPLETED',
      timezone: 'America/Los_Angeles',
      uid: uuidv4(),
    },
  });

  // Past booking 2: 10 days ago at 3:00 PM
  await prisma.booking.create({
    data: {
      eventTypeId: eventTypeQuickChat.id,
      bookerName: 'David Park',
      bookerEmail: 'david.park@techfirm.com',
      bookerNotes: 'Quick intro call to discuss collaboration.',
      startTime: createDate(-10, 15, 0),
      endTime: createDate(-10, 15, 15),
      status: 'COMPLETED',
      timezone: 'America/New_York',
      uid: uuidv4(),
    },
  });

  // Cancelled booking: 2 days ago at 9:00 AM
  await prisma.booking.create({
    data: {
      eventTypeId: eventType30Min.id,
      bookerName: 'Emily Watson',
      bookerEmail: 'emily.watson@agency.org',
      bookerNotes: 'Wanted to discuss design requirements.',
      startTime: createDate(-2, 9, 0),
      endTime: createDate(-2, 9, 30),
      status: 'CANCELLED',
      timezone: 'Europe/London',
      uid: uuidv4(),
    },
  });

  console.log('✅ Created 5 sample bookings');
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
