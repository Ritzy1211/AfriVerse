import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail, getWelcomeEmailHtml, addContactToAudience, removeContactFromAudience } from '@/lib/email';
import * as Sentry from '@sentry/nextjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, source = 'website' } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if already subscribed
    const existingSubscriber = await prisma.subscriber.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingSubscriber) {
      if (existingSubscriber.status === 'ACTIVE') {
        return NextResponse.json(
          { error: 'This email is already subscribed' },
          { status: 409 }
        );
      }
      
      // Reactivate if previously unsubscribed
      if (existingSubscriber.status === 'UNSUBSCRIBED') {
        await prisma.subscriber.update({
          where: { email: normalizedEmail },
          data: {
            status: 'ACTIVE',
            subscribedAt: new Date(),
            unsubscribedAt: null,
            source,
          },
        });

        // Sync to Resend audience
        const nameParts = name?.split(' ') || [];
        await addContactToAudience(normalizedEmail, nameParts[0], nameParts.slice(1).join(' '));

        // Send welcome back email
        try {
          await sendEmail({
            to: normalizedEmail,
            subject: 'Welcome Back to AfriVerse! 🎉',
            html: getWelcomeEmailHtml(name),
          });
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
          Sentry.captureException(emailError);
        }

        return NextResponse.json({
          success: true,
          message: 'Welcome back! Your subscription has been reactivated.',
        });
      }
    }

    // Create new subscriber in database
    const subscriber = await prisma.subscriber.create({
      data: {
        email: normalizedEmail,
        name: name?.trim() || null,
        source,
        status: 'ACTIVE',
      },
    });

    // Sync to Resend audience for campaign management
    const nameParts = name?.split(' ') || [];
    await addContactToAudience(normalizedEmail, nameParts[0], nameParts.slice(1).join(' '));

    // Send welcome email
    try {
      await sendEmail({
        to: normalizedEmail,
        subject: 'Welcome to AfriVerse! 🎉',
        html: getWelcomeEmailHtml(name),
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      Sentry.captureException(emailError);
      // Don't fail the subscription if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to AfriVerse newsletter!',
      subscriberId: subscriber.id,
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    Sentry.captureException(error);
    
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}

// GET - Fetch subscriber count (for admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'count') {
      const count = await prisma.subscriber.count({
        where: { status: 'ACTIVE' },
      });
      return NextResponse.json({ count });
    }

    if (action === 'list') {
      // For admin dashboard
      const subscribers = await prisma.subscriber.findMany({
        orderBy: { subscribedAt: 'desc' },
        take: 100,
      });
      return NextResponse.json({ subscribers });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Newsletter GET error:', error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

// DELETE - Unsubscribe
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    const subscriber = await prisma.subscriber.findUnique({
      where: { email: normalizedEmail },
    });

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Email not found' },
        { status: 404 }
      );
    }

    // Update local database
    await prisma.subscriber.update({
      where: { email: normalizedEmail },
      data: {
        status: 'UNSUBSCRIBED',
        unsubscribedAt: new Date(),
      },
    });

    // Remove from Resend audience
    await removeContactFromAudience(normalizedEmail);

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed',
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}
