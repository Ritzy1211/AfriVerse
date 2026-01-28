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
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://afriverse.africa';
    const logoUrl = 'https://res.cloudinary.com/dnlmfuwst/image/upload/afriverse/Afriverse-logo.png';
    
    try {
      await sendEmail({
        to: adminEmail,
        subject: `[AfriVerse Contact] ${reasonLabel}: ${sanitized.subject}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #0f0f23; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #0f0f23;">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                <img src="${logoUrl}" alt="AfriVerse" style="height: 50px; margin-bottom: 15px;" />
                <h1 style="color: #F39C12; margin: 0; font-size: 24px; font-weight: 700;">📬 New Contact Submission</h1>
                <p style="color: #9ca3af; margin: 10px 0 0 0; font-size: 14px;">Someone reached out via the contact form</p>
              </div>
              
              <!-- Content -->
              <div style="background-color: #ffffff; padding: 35px; border-radius: 0 0 12px 12px;">
                <!-- Category Badge -->
                <div style="text-align: center; margin-bottom: 25px;">
                  <span style="background: linear-gradient(135deg, #F39C12 0%, #e67e22 100%); color: white; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 600;">
                    ${reasonLabel}
                  </span>
                </div>
                
                <!-- Sender Info -->
                <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 20px; border-radius: 12px; margin-bottom: 25px; border-left: 4px solid #F39C12;">
                  <table style="width: 100%;">
                    <tr>
                      <td style="padding: 8px 0; color: #64748b; font-size: 14px;">From:</td>
                      <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${sanitized.name}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Email:</td>
                      <td style="padding: 8px 0;"><a href="mailto:${sanitized.email}" style="color: #F39C12; text-decoration: none; font-weight: 500;">${sanitized.email}</a></td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Subject:</td>
                      <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${sanitized.subject}</td>
                    </tr>
                  </table>
                </div>
                
                <!-- Message -->
                <div style="margin-bottom: 25px;">
                  <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 16px;">💬 Message:</h3>
                  <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; color: #475569; line-height: 1.6; white-space: pre-wrap; border: 1px solid #e2e8f0;">${sanitized.message}</div>
                </div>
                
                <!-- CTA Button -->
                <div style="text-align: center; margin: 30px 0;">
                  <a href="mailto:${sanitized.email}?subject=Re: ${sanitized.subject}" 
                     style="display: inline-block; background: linear-gradient(135deg, #F39C12 0%, #e67e22 100%); color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(243, 156, 18, 0.3);">
                    ✉️ Reply to ${sanitized.name}
                  </a>
                </div>
                
                <!-- Submission Info -->
                <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                  <p style="color: #94a3b8; font-size: 12px; margin: 0;">Submission ID: ${submission.id}</p>
                  <p style="color: #94a3b8; font-size: 12px; margin: 5px 0 0 0;">Received: ${new Date().toLocaleString()}</p>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="padding: 25px; text-align: center;">
                <p style="color: #6b7280; font-size: 12px; margin: 0;">
                  <a href="${siteUrl}/admin" style="color: #F39C12; text-decoration: none;">Go to Admin Dashboard</a>
                </p>
              </div>
            </div>
          </body>
          </html>
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
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #0f0f23; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #0f0f23;">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                <img src="${logoUrl}" alt="AfriVerse" style="height: 50px; margin-bottom: 15px;" />
                <h1 style="color: #F39C12; margin: 0; font-size: 28px; font-weight: 700;">Thanks for reaching out! 🎉</h1>
                <p style="color: #9ca3af; margin: 10px 0 0 0; font-size: 14px;">We've received your message</p>
              </div>
              
              <!-- Content -->
              <div style="background-color: #ffffff; padding: 35px;">
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                  Hi <strong>${sanitized.name}</strong>,
                </p>
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                  Thank you for contacting AfriVerse! We've received your message and our team will get back to you within <strong>24 hours</strong>.
                </p>
                
                <!-- Message Summary -->
                <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 25px; border-radius: 12px; margin-bottom: 30px; border-left: 4px solid #F39C12;">
                  <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 16px;">📝 Your message:</h3>
                  <p style="color: #64748b; margin: 0 0 10px 0; font-size: 14px;"><em>Subject: ${sanitized.subject}</em></p>
                  <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; color: #475569; line-height: 1.6; white-space: pre-wrap; font-size: 14px;">${sanitized.message}</div>
                </div>
                
                <!-- What's Next -->
                <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 12px; margin-bottom: 30px;">
                  <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">⏳ What happens next?</h3>
                  <ul style="color: #92400e; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
                    <li>Our team will review your message</li>
                    <li>You'll receive a personal response within 24 hours</li>
                    <li>Check your inbox (and spam folder, just in case!)</li>
                  </ul>
                </div>
                
                <!-- CTA Section -->
                <div style="text-align: center; margin: 30px 0;">
                  <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">While you wait, explore the latest African stories:</p>
                  <a href="${siteUrl}" 
                     style="display: inline-block; background: linear-gradient(135deg, #F39C12 0%, #e67e22 100%); color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(243, 156, 18, 0.3); margin-right: 10px;">
                    🌍 Visit AfriVerse
                  </a>
                </div>
                
                <!-- Quick Links -->
                <div style="border-top: 1px solid #e5e7eb; padding-top: 25px; margin-top: 25px;">
                  <p style="color: #6b7280; font-size: 14px; text-align: center; margin-bottom: 15px;">Quick Links:</p>
                  <div style="text-align: center;">
                    <a href="${siteUrl}/politics" style="color: #F39C12; text-decoration: none; margin: 0 12px; font-size: 14px;">Politics</a>
                    <a href="${siteUrl}/business" style="color: #F39C12; text-decoration: none; margin: 0 12px; font-size: 14px;">Business</a>
                    <a href="${siteUrl}/technology" style="color: #F39C12; text-decoration: none; margin: 0 12px; font-size: 14px;">Technology</a>
                    <a href="${siteUrl}/entertainment" style="color: #F39C12; text-decoration: none; margin: 0 12px; font-size: 14px;">Entertainment</a>
                  </div>
                </div>
                
                <!-- Sign Off -->
                <div style="margin-top: 30px;">
                  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">
                    Best regards,<br>
                    <strong style="color: #F39C12;">The AfriVerse Team</strong>
                  </p>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 25px; text-align: center; border-radius: 0 0 12px 12px;">
                <p style="color: #9ca3af; font-size: 14px; margin: 0 0 15px 0;">
                  Your Voice, Your Stories, Your Africa 🌍
                </p>
                <div style="margin-bottom: 15px;">
                  <a href="${siteUrl}" style="color: #F39C12; text-decoration: none; margin: 0 10px; font-size: 13px;">Website</a>
                  <span style="color: #4b5563;">|</span>
                  <a href="${siteUrl}/about" style="color: #F39C12; text-decoration: none; margin: 0 10px; font-size: 13px;">About Us</a>
                  <span style="color: #4b5563;">|</span>
                  <a href="${siteUrl}/contact" style="color: #F39C12; text-decoration: none; margin: 0 10px; font-size: 13px;">Contact</a>
                </div>
                <p style="color: #6b7280; font-size: 12px; margin: 0;">
                  © ${new Date().getFullYear()} AfriVerse. All rights reserved.
                </p>
              </div>
            </div>
          </body>
          </html>
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
