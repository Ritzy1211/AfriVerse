import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendEmail, getPasswordResetEmailHtml } from '@/lib/email';

// POST - Request password reset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Always return success to prevent email enumeration attacks
    const successMessage = 'If an account exists with this email, you will receive a password reset link shortly.';

    if (!user) {
      // Don't reveal that user doesn't exist
      return NextResponse.json({ message: successMessage });
    }

    // Delete any existing reset tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email: user.email },
    });

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Token expires in 1 hour
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    // Save token to database
    await prisma.passwordResetToken.create({
      data: {
        email: user.email,
        token: hashedToken,
        expires,
      },
    });

    // Build reset link
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://afriverse.africa';
    const resetLink = `${siteUrl}/writer/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;

    // Send reset email
    try {
      const resetHtml = getPasswordResetEmailHtml(user.name || 'there', resetLink);
      await sendEmail({
        to: user.email,
        subject: 'Reset Your AfriVerse Password',
        html: resetHtml,
      });
      console.log(`Password reset email sent to ${user.email}`);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send reset email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: successMessage });
  } catch (error) {
    console.error('Error in forgot-password:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
