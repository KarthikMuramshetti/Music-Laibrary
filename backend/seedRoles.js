const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Role = require('./models/Role');
require('dotenv').config();

const seedAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const adminRole = await Role.findOne({ roleName: 'admin' });
  if (!adminRole) {
    console.error('Admin role not found. Please run: node seedRoles.js first.');
    process.exit(1);
  }

  const existing = await User.findOne({ email: 'admin@musiclibrary.com' });
  if (existing) {
    console.log('Admin user already exists:', existing.email);
    process.exit();
  }

  const hashed = await bcrypt.hash('Admin@1234', 10);

  await User.create({
    name:     'Admin',
    email:    'admin@musiclibrary.com',
    phone:    '9999999999',
    password: hashed,
    roleId:   adminRole._id
  });

  console.log('Admin user created successfully!');
  console.log('Email   : admin@musiclibrary.com');
  console.log('Password: Admin@1234');
  console.log('>> Change the password after first login if needed.');
  process.exit();
};

seedAdmin().catch(err => {
  console.error(err);
  process.exit(1);
});