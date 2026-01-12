import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

// GET /api/storytellers/apply - Get user's application status
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is already a verified storyteller
    const existingStoryteller = await prisma.verifiedStoryteller.findUnique({
      where: { userId: session.user.id },
    });

    if (existingStoryteller) {
      return NextResponse.json({
        status: 'verified',
        storyteller: existingStoryteller,
      });
    }

    // Check for existing application
    const application = await prisma.storytellerApplication.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    if (application) {
      return NextResponse.json({
        status: 'applied',
        application,
      });
    }

    return NextResponse.json({
      status: 'not_applied',
    });
  } catch (error) {
    console.error('Error fetching application status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 }
    );
  }
}

// POST /api/storytellers/apply - Submit new application
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      country,
      city,
      languages,
      expertise,
      bio,
      credentials,
      portfolioLinks,
      linkedIn,
      twitter,
      whyJoin,
      sampleWork,
      references,
    } = body;

    // Validate required fields
    if (!country || !expertise?.length || !languages?.length || !bio || !whyJoin) {
      return NextResponse.json(
        { error: 'Country, expertise, languages, bio, and why you want to join are required' },
        { status: 400 }
      );
    }

    // Check if user is already a verified storyteller
    const existingStoryteller = await prisma.verifiedStoryteller.findUnique({
      where: { userId: session.user.id },
    });

    if (existingStoryteller) {
      return NextResponse.json(
        { error: 'You are already a verified storyteller' },
        { status: 409 }
      );
    }

    // Check for pending application
    const pendingApplication = await prisma.storytellerApplication.findFirst({
      where: {
        userId: session.user.id,
        status: { in: ['PENDING', 'UNDER_REVIEW'] },
      },
    });

    if (pendingApplication) {
      return NextResponse.json(
        { error: 'You already have a pending application' },
        { status: 409 }
      );
    }

    // Create application - using the actual schema fields
    const application = await prisma.storytellerApplication.create({
      data: {
        userId: session.user.id,
        name: session.user.name || 'Unknown',
        email: session.user.email || '',
        country,
        city,
        languages,
        expertise,
        bio,
        credentials,
        portfolioLinks: portfolioLinks || [],
        linkedIn,
        twitter,
        whyJoin,
        sampleWork,
        references: references || [],
        status: 'PENDING',
      },
    });

    // Send confirmation email
    try {
      await sendEmail({
        to: session.user.email!,
        subject: 'Your Verified Storyteller Application Has Been Received',
        html: `
          <h2>Thank You for Applying!</h2>
          <p>Dear ${session.user.name},</p>
          <p>We have received your application to become a Verified Storyteller on AfriVerse.</p>
          <p>Our editorial team will review your application within 5-7 business days. We'll notify you once a decision has been made.</p>
          <p>In the meantime, feel free to continue contributing to AfriVerse!</p>
          <p>Best regards,<br>The AfriVerse Team</p>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error('Error submitting application:', error);
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}
