const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'john.paulson@afriverse.africa' }
    });
    
    if (!user) {
      console.log('❌ User NOT FOUND in database');
      console.log('\nLet me list all users:');
      const allUsers = await prisma.user.findMany({
        select: { email: true, name: true, role: true }
      });
      console.log('All users:', allUsers);
      return;
    }
    
    console.log('✅ User found:');
    console.log('  Email:', user.email);
    console.log('  Name:', user.name);
    console.log('  Role:', user.role);
    console.log('  Has Password:', user.password ? 'Yes' : 'No');
    
    if (user.password) {
      // Test password
      const testPassword = 'Essence)1';
      const isValid = await bcrypt.compare(testPassword, user.password);
      console.log('\n🔐 Password test for "Essence)1":', isValid ? '✅ VALID' : '❌ INVALID');
      
      if (!isValid) {
        console.log('\nPassword hash in DB:', user.password.substring(0, 20) + '...');
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
