#!/usr/bin/env node

require('dotenv').config();
const { createAdmin } = require('../src/middleware/auth');

const email = process.argv[2];
const password = process.argv[3];
const role = process.argv[4] || 'admin';

if (!email || !password) {
  console.error('Usage: node scripts/createAdmin.js <email> <password> [role]');
  console.error('Example: node scripts/createAdmin.js admin@parallax.app mypassword superadmin');
  process.exit(1);
}

createAdmin(email, password, role)
  .then(admin => {
    console.log('Admin user created successfully:');
    console.log(admin);
    process.exit(0);
  })
  .catch(error => {
    console.error('Failed to create admin:', error.message);
    process.exit(1);
  });
