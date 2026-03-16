const mongoose = require('mongoose');
const Role = require('./models/Role');
require('dotenv').config();

const seedRoles = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await Role.find();
  if (existing.length > 0) {
    console.log('Roles already exist:', existing.map(r => r.roleName));
    process.exit();
  }

  await Role.insertMany([
    { roleName: 'admin' },
    { roleName: 'user' }
  ]);

  console.log('✅ Roles seeded successfully: admin, user');
  process.exit();
};

seedRoles().catch(err => {
  console.error(err);
  process.exit(1);
});