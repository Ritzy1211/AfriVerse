import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as Sentry from '@sentry/nextjs';
import { sendEmail } from '@/lib/email';

// Contact form reason labels
const reasonLabels: Record<string, string> = {
  general: 'General Inquiry',
  advertising: 'Advertising',
  editorial: 'Editorial/Tips',
  support: 'Technical Support',
};

// POST - Submit contact form
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message, reason } = body;

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
      reason: reason || 'general',
    };

    // Save to database
    const submission = await prisma.contactSubmission.create({
      data: {
        name: sanitized.name,
        email: sanitized.email,
        subject: sanitized.subject,
        message: sanitized.message,
      },
    });

    // Send notification email to admin
    const adminEmail = process.env.CONTACT_NOTIFICATION_EMAIL || 'john.paulson@afriverse.africa';
    const reasonLabel = reasonLabels[sanitized.reason] || 'General Inquiry';
    
    try {
      await sendEmail({
        to: adminEmail,
        subject: `[AfriVerse Contact] ${reasonLabel}: ${sanitized.subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1a1a2e; padding: 20px; text-align: center;">
              <h1 style="color: #f59e0b; margin: 0;">New Contact Form Submission</h1>
            </div>
            <div style="padding: 30px; background: #f9fafb;">
              <p style="color: #666; margin-bottom: 20px;">You have received a new message from the AfriVerse contact form.</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <p><strong>Category:</strong> ${reasonLabel}</p>
                <p><strong>Name:</strong> ${sanitized.name}</p>
                <p><strong>Email:</strong> <a href="mailto:${sanitized.email}">${sanitized.email}</a></p>
                <p><strong>Subject:</strong> ${sanitized.subject}</p>
                <p><strong>Message:</strong></p>
                <div style="background: #f3f4f6; padding: 15px; border-radius: 4px; white-space: pre-wrap;">${sanitized.message}</div>
              </div>
              
              <p style="margin-top: 20px; color: #666;">
                <a href="mailto:${sanitized.email}?subject=Re: ${sanitized.subject}" 
                   style="background: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
                  Reply to ${sanitized.name}
                </a>
              </p>
            </div>
            <div style="background: #1a1a2e; padding: 15px; text-align: center;">
              <p style="color: #888; margin: 0; font-size: 12px;">Submission ID: ${submission.id}</p>
            </div>
          </div>
        `,
        replyTo: sanitized.email,
      });
    } catch (emailError) {
      // Log but don't fail - the submission was saved
      console.error('Failed to send notification email:', emailError);
    }

    // Send confirmation email to user
    try {
      await sendEmail({
        to: sanitized.email,
        subject: `We received your message - AfriVerse`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1a1a2e; padding: 20px; text-align: center;">
              <h1 style="color: #f59e0b; margin: 0;">Thanks for reaching out!</h1>
            </div>
            <div style="padding: 30px; background: #f9fafb;">
              <p>Hi ${sanitized.name},</p>
              <p>Thank you for contacting AfriVerse. We've received your message and will get back to you within 24 hours.</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Your message:</strong></p>
                <p><em>Subject: ${sanitized.subject}</em></p>
                <div style="background: #f3f4f6; padding: 15px; border-radius: 4px; white-space: pre-wrap;">${sanitized.message}</div>
              </div>
              
              <p>In the meantime, feel free to explore our latest stories at <a href="https://afriverse.africa">afriverse.africa</a></p>
              
              <p>Best regards,<br>The AfriVerse Team</p>
            </div>
            <div style="background: #1a1a2e; padding: 15px; text-align: center;">
              <p style="color: #888; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} AfriVerse. Your Voice, Your Stories, Your Africa.</p>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

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
