const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

console.log('Testing database connection...');

p.user.findFirst()
  .then(u => console.log('SUCCESS! DB connected. User:', u?.email || 'no users'))
  .catch(e => console.log('FAILED:', e.message))
  .finally(() => p.$disconnect());
