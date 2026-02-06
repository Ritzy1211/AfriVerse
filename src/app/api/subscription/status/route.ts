import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

// GET /api/subscription/status - Check if user is a premium subscriber
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    // Try to get email from query or cookie
    let userEmail = email;
    
    if (!userEmail) {
      const cookieStore = await cookies();
      userEmail = cookieStore.get('subscriber_email')?.value ?? null;
    }

    if (!userEmail) {
      return NextResponse.json({
        isPremium: false,
        subscription: null,
      });
    }

    // Check for active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        email: userEmail,
        status: 'ACTIVE',
        currentPeriodEnd: {
          gte: new Date(),
        },
      },
      orderBy: {
        currentPeriodEnd: 'desc',
      },
    });

    if (subscription) {
      return NextResponse.json({
        isPremium: true,
        subscription: {
          plan: subscription.plan,
          currentPeriodEnd: subscription.currentPeriodEnd,
        },
      });
    }

    // Also check subscriber table for isPremium flag
    const subscriber = await prisma.subscriber.findUnique({
      where: { email: userEmail },
    });

    if (subscriber?.isPremium) {
      return NextResponse.json({
        isPremium: true,
        subscription: null,
      });
    }

    return NextResponse.json({
      isPremium: false,
      subscription: null,
    });

  } catch (error) {
    console.error('Error checking subscription status:', error);
    return NextResponse.json({
      isPremium: false,
      subscription: null,
      error: 'Failed to check subscription status',
    });
  }
}
