import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logActivity, ACTIVITY_ACTIONS } from '@/lib/activity-logger';
import { sendEmail } from '@/lib/email';

// POST - Submit an article for editorial review
// This is the ONLY way a writer can move their article out of DRAFT
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { draftId } = body;

    if (!draftId) {
      return NextResponse.json({ error: 'Draft ID is required' }, { status: 400 });
    }

    // Get the draft and verify ownership
    const draft = await prisma.post.findFirst({
      where: {
        id: draftId,
        authorId: session.user.id, // MUST be owned by this writer
      },
    });

    if (!draft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    // Only allow submission from DRAFT or CHANGES_REQUESTED status
    const submittableStatuses = ['DRAFT', 'CHANGES_REQUESTED'];
    if (!submittableStatuses.includes(draft.status)) {
      return NextResponse.json(
        { error: 'This article cannot be submitted. It may already be under review.' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!draft.title || !draft.content) {
      return NextResponse.json(
        { error: 'Article must have a title and content before submission' },
        { status: 400 }
      );
    }

    if (!draft.category) {
      return NextResponse.json(
        { error: 'Please select a category before submitting' },
        { status: 400 }
      );
    }

    // Check minimum word count
    const wordCount = draft.content.split(/\s+/).filter(Boolean).length;
    if (wordCount < 300) {
      return NextResponse.json(
        { error: 'Article must be at least 300 words' },
        { status: 400 }
      );
    }

    // Update article status to PENDING_REVIEW
    // Writer loses editing rights at this point
    await prisma.post.update({
      where: { id: draftId },
      data: {
        status: 'PENDING_REVIEW',
        updatedAt: new Date(),
      },
    });

    // Create or update editorial review record
    const existingReview = await prisma.editorialReview.findFirst({
      where: { postId: draftId },
    });

    if (existingReview) {
      await prisma.editorialReview.update({
        where: { id: existingReview.id },
        data: {
          status: 'PENDING',
          reviewerId: null, // Clear any previous reviewer
          reviewedAt: null,
        },
      });
    } else {
      await prisma.editorialReview.create({
        data: {
          postId: draftId,
          status: 'PENDING',
          priority: 'NORMAL',
        },
      });
    }

    // Log the activity using the centralized activity logger
    await logActivity({
      postId: draftId,
      userId: session.user.id,
      userName: session.user.name || 'Unknown',
      userRole: session.user.role || 'AUTHOR',
      action: ACTIVITY_ACTIONS.SUBMITTED_FOR_REVIEW,
      details: `Article "${draft.title}" submitted for editorial review`,
    });

    // Notify editors about new submission
    const editors = await prisma.user.findMany({
      where: { role: { in: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'] } },
      select: { email: true, name: true },
      take: 5,
    });

    for (const editor of editors) {
      try {
        await sendEmail({
          to: editor.email,
          subject: `📝 New Article Submission: ${draft.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #F59E0B;">New Article Awaiting Review</h2>
              <p><strong>Title:</strong> ${draft.title}</p>
              <p><strong>Author:</strong> ${session.user.name || session.user.email}</p>
              <p><strong>Category:</strong> ${draft.category}</p>
              <p><strong>Word Count:</strong> ${wordCount} words</p>
              <div style="margin-top: 20px;">
                <a href="${process.env.NEXTAUTH_URL}/admin/review" 
                   style="background-color: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
                  Review Queue
                </a>
              </div>
            </div>
          `,
        });
      } catch (e) {
        console.error(`Failed to notify editor ${editor.email}:`, e);
      }
    }

    return NextResponse.json({
      message: 'Article submitted for editorial review',
      status: 'PENDING_REVIEW',
    });
  } catch (error) {
    console.error('Error submitting for review:', error);
    return NextResponse.json(
      { error: 'Failed to submit article' },
      { status: 500 }
    );
  }
}
