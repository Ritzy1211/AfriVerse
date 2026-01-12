const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Fixing admin login issues...\n');
  
  // 1. Clear all blocked IPs and login attempts
  console.log('1. Clearing login attempts and blocked IPs...');
  
  try {
    const deletedAttempts = await prisma.loginAttempt.deleteMany({});
    console.log('   Deleted', deletedAttempts.count, 'login attempts');
  } catch (e) {
    console.log('   No login attempts to delete or table does not exist');
  }
  
  try {
    const blockedIPs = await prisma.blockedIP?.deleteMany({});
    console.log('   Deleted blocked IPs');
  } catch (e) {
    console.log('   No blocked IPs table or no records');
  }
  
  // 2. Get all users
  console.log('\n2. Checking existing users...');
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    }
  });
  
  console.log('   Found', users.length, 'users:');
  users.forEach(u => console.log('   -', u.email, '(' + u.role + ')'));
  
  // 3. Create or update admin user
  console.log('\n3. Setting up admin user...');
  
  const adminEmail = 'john.paulson@afriverse.africa';
  const adminPassword = 'AfriVerse2025!';
  const hashedPassword = await bcrypt.hash(adminPassword, 12);
  
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });
  
  if (existingAdmin) {
    // Update existing admin's password
    await prisma.user.update({
      where: { email: adminEmail },
      data: { 
        password: hashedPassword,
        role: 'SUPER_ADMIN'
      }
    });
    console.log('   ✅ Updated password for:', adminEmail);
  } else {
    // Create new admin
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'John Paulson',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        bio: 'AfriVerse platform administrator',
      }
    });
    console.log('   ✅ Created new admin:', adminEmail);
  }
  
  // 4. Verify the password works
  console.log('\n4. Verifying password...');
  const admin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });
  
  const isValid = await bcrypt.compare(adminPassword, admin.password);
  console.log('   Password verification:', isValid ? '✅ SUCCESS' : '❌ FAILED');
  
  console.log('\n' + '='.repeat(50));
  console.log('🔐 ADMIN LOGIN CREDENTIALS:');
  console.log('');
  console.log('   Email:    john.paulson@afriverse.africa');
  console.log('   Password: AfriVerse2025!');
  console.log('');
  console.log('='.repeat(50));
  console.log('\n✅ Done! You can now login.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
