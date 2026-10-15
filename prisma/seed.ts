import { PrismaClient, Role, StaffRole, BookingStatus, PaymentStatus, PaymentMethod, AccessCardStatus, MediaType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { SUITES_DATA, HOUSES_DATA, AMENITIES_DATA, MEDIA_GALLERY_DATA, STAFF_DATA } from '../src/config/business';

const prisma = new PrismaClient();

async function main() {
  console.log('[PRISMA SEED] Starting database seeding for Kilifa Suites...');

  // Password hash for seed accounts - loaded strictly from environment, never hardcoded
  const seedPassword = process.env.INITIAL_ADMIN_SEED_PASSWORD;
  const defaultPasswordHash = seedPassword
    ? await bcrypt.hash(seedPassword, 10)
    : null;

  // Seed standard accounts for System Admin
  console.log('[PRISMA SEED] Seeding System Admin (ADMIN) user...');
  const seedUsers = [
    { email: 'admin@kilifasuites.com', name: 'System Administrator', role: Role.ADMIN },
  ];

  const userMap = new Map<string, string>();
  for (const u of seedUsers) {
    const userRecord = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        role: u.role,
        password: defaultPasswordHash,
      },
      create: {
        email: u.email,
        name: u.name,
        role: u.role,
        password: defaultPasswordHash,
      },
    });
    userMap.set(u.email, userRecord.id);
  }

  // 1. Seed Houses
  console.log('[PRISMA SEED] Seeding Houses...');
  const houseMap = new Map<number, string>();
  for (const h of HOUSES_DATA) {
    const createdHouse = await prisma.house.upsert({
      where: { houseNumber: h.houseNumber },
      update: {
        title: h.title,
        description: h.description,
        totalSuites: h.totalSuites,
      },
      create: {
        houseNumber: h.houseNumber,
        title: h.title,
        description: h.description,
        totalSuites: h.totalSuites,
      },
    });
    houseMap.set(h.houseNumber, createdHouse.id);
  }

  // 2. Seed Amenities
  console.log('[PRISMA SEED] Seeding Amenities...');
  const amenityMap = new Map<string, string>();
  for (const a of AMENITIES_DATA) {
    const existing = await prisma.amenity.findFirst({ where: { name: a.name } });
    if (existing) {
      amenityMap.set(a.id, existing.id);
    } else {
      const createdAmenity = await prisma.amenity.create({
        data: {
          name: a.name,
          category: a.category,
          icon: a.icon,
          description: a.description,
        },
      });
      amenityMap.set(a.id, createdAmenity.id);
    }
  }

  // 3. Seed Suites (Seeding the 12 suites with exact placeholder names: [SUITE NAME 01] .. [SUITE NAME 12])
  console.log('[PRISMA SEED] Seeding 12 Suites...');
  for (const s of SUITES_DATA) {
    const houseId = houseMap.get(s.houseNumber);
    const floorString = s.floor === 'Ground Floor' ? 'Ground' : 'Upper';

    await prisma.suite.upsert({
      where: { slug: s.slug },
      update: {
        name: s.name, // Exact placeholder name e.g. "[SUITE NAME 01]"
        houseNumber: s.houseNumber,
        floor: floorString,
        pricePerNight: s.pricePerNight,
        maxOccupancy: s.maxOccupancy,
        bedrooms: s.bedrooms,
        bathrooms: s.bathrooms,
        parlor: true,
        description: s.description,
        houseId: houseId,
      },
      create: {
        slug: s.slug,
        name: s.name, // Exact placeholder name e.g. "[SUITE NAME 01]"
        houseNumber: s.houseNumber,
        floor: floorString,
        pricePerNight: s.pricePerNight,
        maxOccupancy: s.maxOccupancy,
        bedrooms: s.bedrooms,
        bathrooms: s.bathrooms,
        parlor: true,
        description: s.description,
        houseId: houseId,
      },
    });
  }

  // 4. Seed Staff Profiles
  console.log('[PRISMA SEED] Seeding Staff Profiles...');
  for (const stf of STAFF_DATA) {
    let roleEnum: StaffRole = StaffRole.HOSPITALITY;
    if (stf.role === 'owner') roleEnum = StaffRole.OWNER;
    else if (stf.role === 'manager') roleEnum = StaffRole.MANAGER;
    else if (stf.role === 'concierge') roleEnum = StaffRole.CONCIERGE;
    else if (stf.role === 'security') roleEnum = StaffRole.SECURITY;
    else if (stf.role === 'operations') roleEnum = StaffRole.OPERATIONS;

    const existingStaff = await prisma.staff.findFirst({ where: { name: stf.name, role: roleEnum } });
    if (!existingStaff) {
      await prisma.staff.create({
        data: {
          name: stf.name,
          title: stf.title,
          position: stf.position || stf.title,
          bio: stf.bio,
          avatar: stf.avatar,
          role: roleEnum,
          department: stf.department || 'Kilifa Suites Team',
          order: stf.order || 0,
          email: stf.socialLinks?.email,
          whatsapp: stf.socialLinks?.whatsapp,
          linkedin: stf.socialLinks?.linkedin,
          twitter: stf.socialLinks?.twitter,
        },
      });
    }
  }

  // 5. Seed Media Items
  console.log('[PRISMA SEED] Seeding Media Gallery...');
  for (const m of MEDIA_GALLERY_DATA) {
    const titleText = m.caption || m.alt || 'Media Item';
    const existingMedia = await prisma.media.findFirst({ where: { title: titleText } });
    if (!existingMedia) {
      await prisma.media.create({
        data: {
          title: titleText,
          url: m.url,
          type: m.type === 'video' ? MediaType.VIDEO : MediaType.IMAGE,
          category: m.category,
          caption: m.caption,
        },
      });
    }
  }

  // 6. Seed Demo Guest Profile
  console.log('[PRISMA SEED] Seeding Demo Guest Profile...');
  const guestUserId = userMap.get('musa.njie@example.com');

  const demoGuest = await prisma.guest.upsert({
    where: { email: 'musa.njie@example.com' },
    update: {
      fullName: 'Musa Njie',
      phone: '+2207000000',
      country: 'The Gambia',
      vipStatus: true,
      totalBookings: 1,
      userId: guestUserId,
    },
    create: {
      fullName: 'Musa Njie',
      email: 'musa.njie@example.com',
      phone: '+2207000000',
      country: 'The Gambia',
      vipStatus: true,
      totalBookings: 1,
      userId: guestUserId,
    },
  });

  // 7. Seed Initial Booking with Payment & AccessCard relationships
  console.log('[PRISMA SEED] Seeding Initial Booking with Payment & AccessCard...');
  const firstSuite = await prisma.suite.findFirst({ where: { slug: 'suite-01' } });
  if (firstSuite) {
    const bookingRef = 'KS-882910';
    const existingBooking = await prisma.booking.findUnique({
      where: { bookingReference: bookingRef },
    });

    if (!existingBooking) {
      const createdBooking = await prisma.booking.create({
        data: {
          bookingReference: bookingRef,
          fullName: 'Musa Njie',
          email: 'musa.njie@example.com',
          phone: '+2207000000',
          checkIn: new Date('2026-08-20T14:00:00Z'),
          checkOut: new Date('2026-08-23T11:00:00Z'),
          guestsCount: 2,
          pricePerNight: firstSuite.pricePerNight,
          totalNights: 3,
          totalEstimatedPrice: firstSuite.pricePerNight * 3,
          specialRequests: 'Airport shuttle pickup & quiet room requested',
          status: BookingStatus.PENDING,
          suiteId: firstSuite.id,
          guestId: demoGuest.id,
        },
      });

      // Seed Payment relationship
      await prisma.payment.create({
        data: {
          amount: createdBooking.totalEstimatedPrice,
          currency: 'GMD',
          status: PaymentStatus.PENDING,
          method: PaymentMethod.CASH,
          transactionRef: 'TXN-KS-882910',
          bookingId: createdBooking.id,
        },
      });

      // Seed AccessCard relationship
      await prisma.accessCard.create({
        data: {
          cardNumber: 'AC-KS-0101',
          pinCode: '4829',
          status: AccessCardStatus.INACTIVE,
          validFrom: createdBooking.checkIn,
          validUntil: createdBooking.checkOut,
          bookingId: createdBooking.id,
        },
      });

      // Seed Notification
      if (guestUserId) {
        await prisma.notification.create({
          data: {
            title: 'Booking Request Submitted',
            message: `Your booking request for ${firstSuite.name} (Ref: ${bookingRef}) has been received.`,
            userId: guestUserId,
          },
        });
      }
    }
  }

  console.log('[PRISMA SEED] Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('[PRISMA SEED ERROR]', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
