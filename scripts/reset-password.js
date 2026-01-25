const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    const email = 'john.paulson@afriverse.africa';
    const newPassword = 'Essence)1';
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update user
    const user = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });
    
    console.log('✅ Password reset successfully for:', user.email);
    console.log('   Name:', user.name);
    console.log('   Role:', user.role);
    console.log('\n🔑 New password: Essence)1');
    console.log('\nYou can now log in at /admin/login');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
