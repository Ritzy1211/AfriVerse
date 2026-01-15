import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Scheduled Posts Publisher Cron Job
//
// This endpoint automatically publishes posts that are scheduled and due.
// Should be called every 5 minutes to ensure timely publishing.
//
// Schedule: Every 5 minutes
// Cron expression: see vercel.json for schedule config

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
    const now = new Date();
    
    // Find all scheduled posts that are due
    const scheduledPosts = await prisma.post.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: {
          lte: now
        }
      },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (scheduledPosts.length === 0) {
      return NextResponse.json({ 
        message: 'No scheduled posts to publish',
        publishedCount: 0,
        timestamp: now.toISOString()
      });
    }

    // Publish each post
    const publishedPosts = [];
    const errors = [];

    for (const post of scheduledPosts) {
      try {
        await prisma.post.update({
          where: { id: post.id },
          data: {
            status: 'PUBLISHED',
            publishedAt: now,
            scheduledAt: null // Clear the scheduled date
          }
        });

        publishedPosts.push({
          id: post.id,
          title: post.title,
          slug: post.slug,
          author: post.author?.name || 'Unknown'
        });

        console.log(`[Cron] Auto-published: "${post.title}" (${post.id})`);
      } catch (error) {
        console.error(`[Cron] Failed to publish ${post.id}:`, error);
        errors.push({
          id: post.id,
          title: post.title,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      message: `Published ${publishedPosts.length} scheduled posts`,
      publishedCount: publishedPosts.length,
      errorCount: errors.length,
      publishedPosts,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: now.toISOString()
    });
  } catch (error) {
    console.error('[Cron] Scheduled publishing error:', error);
    return NextResponse.json(
      { error: 'Failed to process scheduled posts' },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggering from admin
export async function POST(request: Request) {
  return GET(request);
}
