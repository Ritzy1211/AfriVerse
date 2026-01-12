import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Role check helper
const hasPermission = (userRole: string, minRole: string): boolean => {
  const ROLE_LEVEL: Record<string, number> = {
    CONTRIBUTOR: 1,
    AUTHOR: 2,
    SENIOR_WRITER: 3,
    EDITOR: 4,
    ADMIN: 5,
    SUPER_ADMIN: 6,
  };
  return (ROLE_LEVEL[userRole] || 0) >= (ROLE_LEVEL[minRole] || 0);
};

// GET /api/admin/storytellers - Get all storytellers and applications
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session.user.role as string, 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // 'applications', 'verified', 'all'
    const status = searchParams.get('status');

    let applications: any[] = [];
    let storytellers: any[] = [];

    if (type === 'applications' || type === 'all') {
      const appWhere: any = {};
      if (status && status !== 'all') {
        appWhere.status = status;
      }

      // StorytellerApplication doesn't have user relation, just has userId
      applications = await prisma.storytellerApplication.findMany({
        where: appWhere,
        orderBy: { createdAt: 'desc' },
      });
    }

    if (type === 'verified' || type === 'all') {
      storytellers = await prisma.verifiedStoryteller.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: { verifiedAt: 'desc' },
      });
    }

    return NextResponse.json({ applications, storytellers });
  } catch (error) {
    console.error('Error fetching storytellers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch storytellers' },
      { status: 500 }
    );
  }
}

// POST /api/admin/storytellers - Create verified storyteller (approve application)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session.user.role as string, 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { applicationId, badgeLevel = 'BRONZE' } = body;

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }

    // Get the application
    const application = await prisma.storytellerApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    if (!application.userId) {
      return NextResponse.json(
        { error: 'Application has no associated user' },
        { status: 400 }
      );
    }

    // Check if already verified
    const existingStoryteller = await prisma.verifiedStoryteller.findUnique({
      where: { userId: application.userId },
    });

    if (existingStoryteller) {
      return NextResponse.json(
        { error: 'User is already a verified storyteller' },
        { status: 409 }
      );
    }

    // Create verified storyteller and update application in a transaction
    const result = await prisma.$transaction([
      prisma.verifiedStoryteller.create({
        data: {
          userId: application.userId,
          displayName: application.name,
          bio: application.bio,
          expertise: application.expertise,
          languages: application.languages,
          country: application.country,
          city: application.city,
          credentials: application.credentials ? [application.credentials] : [],
          portfolioLinks: application.portfolioLinks,
          badgeLevel: badgeLevel as any,
          status: 'VERIFIED',
          verifiedAt: new Date(),
          verifiedBy: session.user.id,
        },
      }),
      prisma.storytellerApplication.update({
        where: { id: applicationId },
        data: {
          status: 'APPROVED',
          reviewedAt: new Date(),
          reviewedBy: session.user.id,
        },
      }),
    ]);

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating storyteller:', error);
    return NextResponse.json(
      { error: 'Failed to create storyteller' },
      { status: 500 }
    );
  }
}
