const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Checking users in database...\n');
  
  // Get all users
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      password: true,
    }
  });
  
  console.log('Found', users.length, 'users:\n');
  
  users.forEach(user => {
    console.log('- Email:', user.email);
    console.log('  Name:', user.name);
    console.log('  Role:', user.role);
    console.log('  Has Password:', !!user.password);
    console.log('');
  });
  
  // If no admin exists, create one
  if (users.length === 0 || !users.find(u => u.role === 'SUPER_ADMIN')) {
    console.log('\n⚠️  No SUPER_ADMIN found! Creating one...\n');
    
    const hashedPassword = await bcrypt.hash('AfriVerse2025!', 12);
    
    const admin = await prisma.user.create({
      data: {
        email: 'john.paulson@afriverse.africa',
        name: 'John Paulson',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        bio: 'AfriVerse platform administrator',
      },
    });
    
    console.log('✅ Created admin:', admin.email);
  } else {
    // Reset the admin password
    const admin = users.find(u => u.role === 'SUPER_ADMIN');
    if (admin) {
      console.log('\n🔄 Resetting password for:', admin.email);
      
      const hashedPassword = await bcrypt.hash('AfriVerse2025!', 12);
      
      await prisma.user.update({
        where: { id: admin.id },
        data: { password: hashedPassword }
      });
      
      console.log('✅ Password reset successfully!');
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🔐 Login Credentials:');
  console.log('   Email: john.paulson@afriverse.africa');
  console.log('   Password: AfriVerse2025!');
  console.log('='.repeat(50));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
