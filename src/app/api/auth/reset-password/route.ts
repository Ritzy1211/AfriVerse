import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

// POST - Reset password with token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, email, password } = body;

    if (!token || !email || !password) {
      return NextResponse.json(
        { error: 'Token, email, and new password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find valid token
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        token: hashedToken,
        expires: {
          gt: new Date(), // Token must not be expired
        },
      },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid or expired reset link. Please request a new one.' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: resetToken.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Delete all reset tokens for this email (cleanup)
    await prisma.passwordResetToken.deleteMany({
      where: { email: resetToken.email },
    });

    console.log(`Password reset successful for ${user.email}`);

    return NextResponse.json({
      message: 'Password reset successfully. You can now login with your new password.',
    });
  } catch (error) {
    console.error('Error in reset-password:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

// GET - Verify token is valid (for page validation)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      return NextResponse.json(
        { valid: false, error: 'Missing token or email' },
        { status: 400 }
      );
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Check if token exists and is valid
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        token: hashedToken,
        expires: {
          gt: new Date(),
        },
      },
    });

    if (!resetToken) {
      return NextResponse.json({
        valid: false,
        error: 'Invalid or expired reset link',
      });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('Error verifying reset token:', error);
    return NextResponse.json(
      { valid: false, error: 'Failed to verify token' },
      { status: 500 }
    );
  }
}
