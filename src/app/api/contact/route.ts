import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as Sentry from '@sentry/nextjs';

// POST - Submit contact form
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitized = {
      name: name.trim().slice(0, 100),
      email: email.toLowerCase().trim(),
      subject: subject.trim().slice(0, 200),
      message: message.trim().slice(0, 5000),
    };

    // Save to database
    const submission = await prisma.contactSubmission.create({
      data: sanitized,
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you for your message! We\'ll get back to you soon.',
      id: submission.id,
    });

  } catch (error) {
    console.error('Contact form error:', error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: 'Failed to submit message. Please try again.' },
      { status: 500 }
    );
  }
}

// GET - Fetch submissions (admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const whereClause = status && status !== 'ALL' 
      ? { status: status as any } 
      : undefined;

    const [submissions, total] = await Promise.all([
      prisma.contactSubmission.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.contactSubmission.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      submissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Fetch contact submissions error:', error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

// PATCH - Update submission status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID and status are required' },
        { status: 400 }
      );
    }

    await prisma.contactSubmission.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      message: 'Status updated',
    });

  } catch (error) {
    console.error('Update submission error:', error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    );
  }
}
