import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { User } from '../models/User';

const SEED_USERS = [
  { name: 'Admin User',        email: 'admin@lms.com',        password: 'Admin@123',        role: 'admin' },
  { name: 'Sales Executive',   email: 'sales@lms.com',        password: 'Sales@123',        role: 'sales' },
  { name: 'Sanction Officer',  email: 'sanction@lms.com',     password: 'Sanction@123',     role: 'sanction' },
  { name: 'Disbursal Officer', email: 'disbursement@lms.com', password: 'Disburse@123',     role: 'disbursement' },
  { name: 'Collection Agent',  email: 'collection@lms.com',   password: 'Collect@123',      role: 'collection' },
  { name: 'Test Borrower',     email: 'borrower@lms.com',     password: 'Borrower@123',     role: 'borrower' },
] as const;

const seed = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('MONGODB_URI not set'); process.exit(1); }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  for (const u of SEED_USERS) {
    const exists = await User.findOne({ email: u.email });
    if (exists) {
      console.log(`⏭️  Skipping ${u.email} (already exists)`);
      continue;
    }
    await User.create(u);
    console.log(`✅  Created ${u.role}: ${u.email} / ${u.password}`);
  }

  console.log('\n🎉 Seed complete! Login credentials:');
  SEED_USERS.forEach(u => console.log(`   ${u.role.padEnd(12)} → ${u.email} / ${u.password}`));

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
