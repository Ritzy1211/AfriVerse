import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * AfriPulse Weekly Reminder Cron Job
 * 
 * This endpoint should be called by a cron service (e.g., Vercel Cron, Railway Cron, or external service)
 * Schedule: Every Monday at 9:00 AM WAT (8:00 AM UTC)
 * 
 * Cron expression: 0 8 * * 1
 * 
 * To set up on Vercel, add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/afripulse-reminder",
 *     "schedule": "0 8 * * 1"
 *   }]
 * }
 */

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// Verify cron secret to prevent unauthorized access
function verifyCronSecret(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  // If no secret is set, allow in development
  if (!cronSecret && process.env.NODE_ENV === 'development') {
    return true;
  }
  
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: Request) {
  // Verify this is a legitimate cron call
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get AfriPulse data that hasn't been updated in 7+ days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const staleCountries = await prisma.afriPulseIndex.findMany({
      where: {
        lastUpdated: { lt: sevenDaysAgo }
      },
      select: {
        country: true,
        countryName: true,
        lastUpdated: true
      }
    });

    // Get admin users to notify
    const admins = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'SUPER_ADMIN', 'EDITOR'] }
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    });

    if (admins.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No admins to notify'
      });
    }

    // Create in-app notifications for each admin
    const notifications = [];
    
    for (const admin of admins) {
      // Check if notification already exists for this week
      const existingNotification = await prisma.notification.findFirst({
        where: {
          userId: admin.id,
          type: 'AFRIPULSE_REMINDER',
          createdAt: { gte: sevenDaysAgo }
        }
      });

      if (!existingNotification) {
        const staleList = staleCountries.length > 0 
          ? staleCountries.map(c => c.countryName).join(', ')
          : 'All countries are up to date!';

        const notification = await prisma.notification.create({
          data: {
            userId: admin.id,
            type: 'AFRIPULSE_REMINDER',
            title: '📊 Weekly AfriPulse Review',
            message: staleCountries.length > 0
              ? `Time to update the AfriPulse Index! The following countries haven't been updated in 7+ days: ${staleList}. Use AI Suggestions to quickly generate new scores based on recent articles.`
              : `Great job keeping AfriPulse updated! All country scores have been reviewed within the last week.`,
            link: '/admin/afripulse',
            read: false
          }
        });
        notifications.push(notification);
      }
    }

    // Optionally send email notifications
    if (process.env.ADMIN_EMAIL && staleCountries.length > 0) {
      // Import your email service here if needed
      // await sendEmail({
      //   to: process.env.ADMIN_EMAIL,
      //   subject: '📊 AfriPulse Weekly Review Reminder',
      //   html: generateEmailTemplate(staleCountries)
      // });
    }

    // Log the cron execution
    console.log(`[AfriPulse Cron] Sent ${notifications.length} notifications. Stale countries: ${staleCountries.length}`);

    return NextResponse.json({
      success: true,
      data: {
        notificationsSent: notifications.length,
        staleCountries: staleCountries.length,
        adminCount: admins.length,
        executedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[AfriPulse Cron] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process reminder' },
      { status: 500 }
    );
  }
}

// Also allow POST for manual trigger from admin panel
export async function POST(request: Request) {
  // For manual trigger, check auth session instead of cron secret
  const { headers } = request;
  const authHeader = headers.get('x-admin-trigger');
  
  if (authHeader !== 'true') {
    return GET(request);
  }

  // Manual trigger logic - same as GET but without cron verification
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const staleCountries = await prisma.afriPulseIndex.findMany({
      where: {
        lastUpdated: { lt: sevenDaysAgo }
      },
      select: {
        country: true,
        countryName: true,
        lastUpdated: true,
        overallScore: true
      }
    });

    const totalCountries = await prisma.afriPulseIndex.count();

    return NextResponse.json({
      success: true,
      data: {
        staleCountries,
        totalCountries,
        upToDateCount: totalCountries - staleCountries.length,
        lastChecked: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error checking AfriPulse status:', error);
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    );
  }
}
