import 'dotenv/config';
import { DatabaseService } from '../services/database';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import {
  users,
  practices,
  locations,
  userPractices,
  patients,
  appointments,
  integrations,
  type NewUser,
  type NewPractice,
  type NewLocation,
  type NewUserPractice,
  type NewPatient,
  type NewAppointment,
  type NewIntegration,
} from './schema';

async function main() {
  const dbService = DatabaseService.getInstance();
  await dbService.initialize();
  const db = dbService.getDb();

  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);

  // 1) Practices
  const practiceSeed: NewPractice[] = [
    {
      name: 'Smiles Dental - Downtown',
      address: { street: '100 Main St', city: 'Metropolis', state: 'NY', zipCode: '10001', country: 'USA' },
      phone: '212-555-0100',
      email: 'downtown@smilesdental.demo',
      operatingHours: { mon: ['08:00','17:00'], tue: ['08:00','17:00'], wed: ['08:00','17:00'], thu: ['08:00','17:00'], fri: ['08:00','15:00'] },
      isActive: true,
    },
    {
      name: 'Smiles Dental - Westside',
      address: { street: '200 Oak Ave', city: 'Metropolis', state: 'NY', zipCode: '10002', country: 'USA' },
      phone: '212-555-0200',
      email: 'westside@smilesdental.demo',
      operatingHours: { mon: ['08:00','17:00'], tue: ['08:00','17:00'], wed: ['08:00','17:00'], thu: ['08:00','17:00'], fri: ['08:00','15:00'] },
      isActive: true,
    },
    {
      name: 'Smiles Dental - Northgate',
      address: { street: '300 Pine Rd', city: 'Metropolis', state: 'NY', zipCode: '10003', country: 'USA' },
      phone: '212-555-0300',
      email: 'northgate@smilesdental.demo',
      operatingHours: { mon: ['08:00','17:00'], tue: ['08:00','17:00'], wed: ['08:00','17:00'], thu: ['08:00','17:00'], fri: ['08:00','15:00'] },
      isActive: true,
    },
  ];

  const insertedPractices = await db
    .insert(practices)
    .values(practiceSeed)
    .onConflictDoNothing()
    .returning();

  // Map by name for easier lookup
  const practiceByName = new Map(insertedPractices.map((p: any) => [p.name, p]));

  // 2) Locations (2 per practice)
  const locationSeed: NewLocation[] = [];
  for (const p of insertedPractices) {
    locationSeed.push(
      {
        practiceId: p.id,
        name: `${p.name} - Suite A` ,
        address: p.address,
        phone: p.phone,
        email: p.email,
        operatingHours: p.operatingHours,
        isActive: true,
      },
      {
        practiceId: p.id,
        name: `${p.name} - Suite B` ,
        address: p.address,
        phone: p.phone,
        email: p.email,
        operatingHours: p.operatingHours,
        isActive: true,
      }
    );
  }
  const insertedLocations = await db
    .insert(locations)
    .values(locationSeed)
    .onConflictDoNothing()
    .returning();

  // 3) Users
  const usersSeed: Array<NewUser & { plainPassword: string; practiceNames: string[] }> = [
    {
      email: 'admin@practice.com',
      passwordHash: bcrypt.hashSync('Admin123!', saltRounds),
      role: 'admin' as any,
      firstName: 'System',
      lastName: 'Admin',
      active: true as any,
      plainPassword: 'Admin123!',
      practiceNames: Array.from(practiceByName.keys()),
    },
    {
      email: 'executive@practice.com',
      passwordHash: bcrypt.hashSync('Demo123!', saltRounds),
      role: 'executive' as any,
      firstName: 'Alex',
      lastName: 'Executive',
      active: true as any,
      plainPassword: 'Demo123!',
      practiceNames: Array.from(practiceByName.keys()),
    },
    {
      email: 'manager@practice.com',
      passwordHash: bcrypt.hashSync('Demo123!', saltRounds),
      role: 'manager' as any,
      firstName: 'Morgan',
      lastName: 'Manager',
      active: true as any,
      plainPassword: 'Demo123!',
      practiceNames: ['Smiles Dental - Downtown'],
    },
    {
      email: 'dr.clark@practice.com',
      passwordHash: bcrypt.hashSync('Demo123!', saltRounds),
      role: 'clinician' as any,
      firstName: 'Evelyn',
      lastName: 'Clark',
      active: true as any,
      plainPassword: 'Demo123!',
      practiceNames: ['Smiles Dental - Downtown','Smiles Dental - Westside'],
    },
  ];

  const insertedUsers = await db
    .insert(users)
    .values(usersSeed.map(({ plainPassword, practiceNames, ...u }) => u))
    .onConflictDoNothing({ target: [users.email] })
    .returning();

  const userByEmail = new Map(insertedUsers.map((u: any) => [u.email, u]));

  // 4) User-Practice roles
  const userPracticeSeed: NewUserPractice[] = [];
  for (const u of usersSeed) {
    const insertedUser = userByEmail.get(u.email);
    if (!insertedUser) continue;
    for (const name of u.practiceNames) {
      const p = practiceByName.get(name);
      if (!p) continue;
      userPracticeSeed.push({ userId: insertedUser.id, practiceId: p.id, role: u.role as any, isActive: true as any });
    }
  }
  await db.insert(userPractices).values(userPracticeSeed).onConflictDoNothing();

  // 5) Patients (10 per practice)
  const patientSeed: NewPatient[] = [];
  for (const p of insertedPractices) {
    for (let i = 1; i <= 10; i++) {
      patientSeed.push({
        practiceId: p.id,
        firstName: `Patient${i}`,
        lastName: p.name.includes('Downtown') ? 'Downtown' : p.name.includes('Westside') ? 'Westside' : 'Northgate',
        email: `patient${i}.${p.id.slice(0,6)}@demo.local`,
        phone: `212-555-${String(1000 + i).padStart(4,'0')}`,
        status: 'active' as any,
      });
    }
  }
  const insertedPatients = await db.insert(patients).values(patientSeed).onConflictDoNothing().returning();

  // Helper to get random item
  const rand = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

  // 6) Appointments (random over the last 60 days)
  const providerUsers = insertedUsers.filter((u: any) => ['clinician','manager','executive','admin'].includes(u.role));
  const apptSeed: NewAppointment[] = [];
  for (const p of insertedPractices) {
    const pPatients = insertedPatients.filter((pt: any) => pt.practiceId === p.id);
    const pLocations = insertedLocations.filter((l: any) => l.practiceId === p.id);
    for (let d = 0; d < 60; d++) {
      const day = new Date();
      day.setDate(day.getDate() - d);
      const count = 4 + Math.floor(Math.random() * 6); // 4-9 appts per day
      for (let k = 0; k < count; k++) {
        const start = new Date(day);
        start.setHours(8 + Math.floor(Math.random()*8));
        start.setMinutes(Math.floor(Math.random()*2) ? 0 : 30);
        const end = new Date(start.getTime() + (30 + Math.floor(Math.random()*60)) * 60000);
        const procFee = 80 + Math.floor(Math.random()*900);
        apptSeed.push({
          practiceId: p.id,
          patientId: rand(pPatients).id,
          providerId: rand(providerUsers).id,
          locationId: rand(pLocations)?.id,
          scheduledStart: start,
          scheduledEnd: end,
          appointmentType: 'General Dentistry',
          procedures: [{ code: 'D1110', description: 'Prophylaxis - Adult', fee: procFee }],
          status: (['completed','scheduled','confirmed'] as any[])[Math.floor(Math.random()*3)],
        });
      }
    }
  }
  await db.insert(appointments).values(apptSeed).onConflictDoNothing();

  // 7) Integrations
  const integrationsSeed: NewIntegration[] = Array.from(insertedPractices).flatMap((p: any) => ([
    { practiceId: p.id, type: 'dentrix' as any, name: 'Dentrix', status: 'connected' as any, config: {}, isActive: true as any },
    { practiceId: p.id, type: 'dentalintel' as any, name: 'DentalIntel', status: 'connected' as any, config: {}, isActive: true as any },
    { practiceId: p.id, type: 'adp' as any, name: 'ADP', status: 'syncing' as any, config: {}, isActive: true as any },
  ]));
  await db.insert(integrations).values(integrationsSeed).onConflictDoNothing();

  console.log('✅ Seed completed');
  await dbService.close();
}

main().catch(async (err) => {
  console.error('❌ Seed failed', err);
  try { await DatabaseService.getInstance().close(); } catch {}
  process.exit(1);
});

