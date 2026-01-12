import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET /api/admin/reset-login - Clear login blocks and optionally reset password
// This is a special recovery endpoint - should be removed or secured in production
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const secretKey = searchParams.get('key');
    
    // Simple protection - require a secret key
    if (secretKey !== 'afriverse-reset-2026') {
      return NextResponse.json({ error: 'Invalid key' }, { status: 401 });
    }
    
    // 1. Clear all login attempts
    const deletedAttempts = await prisma.loginAttempt.deleteMany({});
    
    // 2. Reset admin password
    const adminEmail = 'john.paulson@afriverse.africa';
    const adminPassword = 'AfriVerse2025!';
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    // Check if admin exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    let adminResult;
    if (existingAdmin) {
      adminResult = await prisma.user.update({
        where: { email: adminEmail },
        data: { 
          password: hashedPassword,
          role: 'SUPER_ADMIN'
        }
      });
    } else {
      adminResult = await prisma.user.create({
        data: {
          email: adminEmail,
          name: 'John Paulson',
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          bio: 'AfriVerse platform administrator'
        }
      });
    }
    
    // 3. Get all users for info
    const allUsers = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        role: true
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Login reset complete',
      data: {
        loginAttemptsCleared: deletedAttempts.count,
        adminEmail: adminEmail,
        adminPassword: adminPassword,
        adminCreated: !existingAdmin,
        allUsers: allUsers
      }
    });
  } catch (error) {
    console.error('Reset error:', error);
    return NextResponse.json({ 
      error: 'Reset failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
