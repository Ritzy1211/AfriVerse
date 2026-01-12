// Run this script with: npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/reset-admin.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetAdmin() {
  console.log('🔧 Resetting admin credentials...\n');
  
  const adminEmail = 'john.paulson@afriverse.africa';
  const adminPassword = 'AfriVerse2025!';
  
  // Hash the password
  const hashedPassword = await bcrypt.hash(adminPassword, 12);
  
  // Delete all login attempts to clear the block
  const deletedAttempts = await prisma.loginAttempt.deleteMany({});
  console.log('Cleared', deletedAttempts.count, 'login attempts');
  
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail }
  });
  
  if (existingUser) {
    // Update password
    await prisma.user.update({
      where: { email: adminEmail },
      data: { password: hashedPassword }
    });
    console.log('✅ Password updated for:', adminEmail);
  } else {
    // Create user
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'John Paulson',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        bio: 'AfriVerse platform administrator',
      }
    });
    console.log('✅ Created admin user:', adminEmail);
  }
  
  console.log('\n========================================');
  console.log('LOGIN CREDENTIALS:');
  console.log('Email:    john.paulson@afriverse.africa');
  console.log('Password: AfriVerse2025!');
  console.log('========================================\n');
  
  await prisma.$disconnect();
}

resetAdmin().catch(console.error);
