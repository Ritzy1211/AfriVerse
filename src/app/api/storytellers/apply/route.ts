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
    
    const body = await request.json();
    const {
      fullName,
      email,
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

    // Get name and email from form or session
    const applicantName = fullName || session?.user?.name || 'Unknown';
    const applicantEmail = email || session?.user?.email;

    // Validate required fields
    if (!applicantEmail) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    if (!applicantName || applicantName === 'Unknown') {
      return NextResponse.json(
        { error: 'Full name is required' },
        { status: 400 }
      );
    }

    if (!country || !expertise?.length || !languages?.length || !bio || !whyJoin) {
      return NextResponse.json(
        { error: 'Country, expertise, languages, bio, and why you want to join are required' },
        { status: 400 }
      );
    }

    // If user is logged in, check for existing applications
    if (session?.user?.id) {
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

      // Check for pending application by user ID
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
    } else {
      // For guest applications, check by email
      const pendingApplication = await prisma.storytellerApplication.findFirst({
        where: {
          email: applicantEmail,
          status: { in: ['PENDING', 'UNDER_REVIEW'] },
        },
      });

      if (pendingApplication) {
        return NextResponse.json(
          { error: 'An application with this email is already pending' },
          { status: 409 }
        );
      }
    }

    // Create application
    const application = await prisma.storytellerApplication.create({
      data: {
        userId: session?.user?.id || null,
        name: applicantName,
        email: applicantEmail,
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

    // Site URL and logo for emails
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://afriverse.africa';
    const logoUrl = 'https://res.cloudinary.com/dnlmfuwst/image/upload/afriverse/Afriverse-logo.png';
    const adminEmail = process.env.ADMIN_EMAIL || 'john.paulson@afriverse.africa';

    // Send confirmation email to applicant
    try {
      await sendEmail({
        to: applicantEmail,
        subject: '🎉 Application Received - AfriVerse Storyteller Program',
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
                <h1 style="color: #F39C12; margin: 0; font-size: 26px; font-weight: 700;">Application Received! 🎉</h1>
                <p style="color: #9ca3af; margin: 10px 0 0 0; font-size: 14px;">Verified Storyteller Program</p>
              </div>
              
              <!-- Content -->
              <div style="background-color: #ffffff; padding: 35px;">
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                  Dear <strong>${applicantName}</strong>,
                </p>
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                  Thank you for applying to become a <strong style="color: #F39C12;">Verified Storyteller</strong> on AfriVerse! We're excited that you want to join our community of African voices.
                </p>
                
                <!-- Application Summary -->
                <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 4px solid #F39C12;">
                  <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 16px;">📋 Application Summary</h3>
                  <table style="width: 100%;">
                    <tr>
                      <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Country:</td>
                      <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">${country}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Expertise:</td>
                      <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">${expertise.join(', ')}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Languages:</td>
                      <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">${languages.join(', ')}</td>
                    </tr>
                  </table>
                </div>
                
                <!-- What's Next -->
                <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); padding: 20px; border-radius: 12px; margin-bottom: 25px;">
                  <h3 style="color: #1e40af; margin: 0 0 12px 0; font-size: 16px;">⏳ What Happens Next?</h3>
                  <ol style="color: #1e40af; margin: 0; padding-left: 20px; font-size: 14px; line-height: 2;">
                    <li>Our editorial team will review your application</li>
                    <li>We may reach out for additional information</li>
                    <li>You'll receive a decision within <strong>5-7 business days</strong></li>
                    <li>If approved, you'll get your verified badge! ✓</li>
                  </ol>
                </div>
                
                <!-- Benefits Preview -->
                <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 12px; margin-bottom: 25px;">
                  <h3 style="color: #92400e; margin: 0 0 12px 0; font-size: 16px;">🌟 Verified Storyteller Benefits</h3>
                  <ul style="color: #92400e; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
                    <li>Verified badge on your profile & articles</li>
                    <li>Priority editorial support</li>
                    <li>Featured author placement</li>
                    <li>Access to exclusive assignments</li>
                    <li>Networking with African journalists</li>
                  </ul>
                </div>
                
                <!-- CTA -->
                <div style="text-align: center; margin: 30px 0;">
                  <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">While you wait, keep exploring and contributing:</p>
                  <a href="${siteUrl}" 
                     style="display: inline-block; background: linear-gradient(135deg, #F39C12 0%, #e67e22 100%); color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(243, 156, 18, 0.3);">
                    🌍 Visit AfriVerse
                  </a>
                </div>
                
                <!-- Sign Off -->
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">
                    Best of luck with your application!<br><br>
                    <strong style="color: #F39C12;">The AfriVerse Editorial Team</strong>
                  </p>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 25px; text-align: center; border-radius: 0 0 12px 12px;">
                <p style="color: #9ca3af; font-size: 14px; margin: 0 0 10px 0;">
                  Your Voice, Your Stories, Your Africa 🌍
                </p>
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
      // Don't fail the request if email fails
    }

    // Send notification email to admin
    try {
      await sendEmail({
        to: adminEmail,
        subject: `📝 New Storyteller Application: ${applicantName}`,
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
                <h1 style="color: #F39C12; margin: 0; font-size: 24px; font-weight: 700;">📝 New Storyteller Application</h1>
                <p style="color: #9ca3af; margin: 10px 0 0 0; font-size: 14px;">Requires your review</p>
              </div>
              
              <!-- Content -->
              <div style="background-color: #ffffff; padding: 35px;">
                <!-- Applicant Info -->
                <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 4px solid #F39C12;">
                  <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">👤 Applicant Details</h3>
                  <table style="width: 100%;">
                    <tr>
                      <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 120px;">Name:</td>
                      <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${applicantName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Email:</td>
                      <td style="padding: 8px 0;"><a href="mailto:${applicantEmail}" style="color: #F39C12; text-decoration: none;">${applicantEmail}</a></td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Country:</td>
                      <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">${country}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #64748b; font-size: 14px;">City:</td>
                      <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">${city || 'Not specified'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Expertise:</td>
                      <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">${expertise.join(', ')}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Languages:</td>
                      <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">${languages.join(', ')}</td>
                    </tr>
                  </table>
                </div>
                
                <!-- Bio -->
                <div style="margin-bottom: 25px;">
                  <h3 style="color: #1e293b; margin: 0 0 10px 0; font-size: 16px;">📖 Bio</h3>
                  <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; color: #475569; line-height: 1.6; font-size: 14px;">${bio}</div>
                </div>
                
                <!-- Why Join -->
                <div style="margin-bottom: 25px;">
                  <h3 style="color: #1e293b; margin: 0 0 10px 0; font-size: 16px;">💬 Why They Want to Join</h3>
                  <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; color: #475569; line-height: 1.6; font-size: 14px;">${whyJoin}</div>
                </div>
                
                ${credentials ? `
                <!-- Credentials -->
                <div style="margin-bottom: 25px;">
                  <h3 style="color: #1e293b; margin: 0 0 10px 0; font-size: 16px;">🎓 Credentials</h3>
                  <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; color: #475569; line-height: 1.6; font-size: 14px;">${credentials}</div>
                </div>
                ` : ''}
                
                ${linkedIn || twitter ? `
                <!-- Social Links -->
                <div style="margin-bottom: 25px;">
                  <h3 style="color: #1e293b; margin: 0 0 10px 0; font-size: 16px;">🔗 Social Profiles</h3>
                  <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px;">
                    ${linkedIn ? `<p style="margin: 5px 0;"><a href="${linkedIn}" style="color: #0077b5;">LinkedIn Profile</a></p>` : ''}
                    ${twitter ? `<p style="margin: 5px 0;"><a href="https://twitter.com/${twitter.replace('@', '')}" style="color: #1da1f2;">Twitter: ${twitter}</a></p>` : ''}
                  </div>
                </div>
                ` : ''}
                
                <!-- CTA -->
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${siteUrl}/admin/storytellers" 
                     style="display: inline-block; background: linear-gradient(135deg, #F39C12 0%, #e67e22 100%); color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(243, 156, 18, 0.3);">
                    👀 Review Application
                  </a>
                </div>
                
                <!-- Application ID -->
                <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                  <p style="color: #94a3b8; font-size: 12px; margin: 0;">Application ID: ${application.id}</p>
                  <p style="color: #94a3b8; font-size: 12px; margin: 5px 0 0 0;">Submitted: ${new Date().toLocaleString()}</p>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="padding: 25px; text-align: center;">
                <p style="color: #6b7280; font-size: 12px; margin: 0;">
                  <a href="${siteUrl}/admin/storytellers" style="color: #F39C12; text-decoration: none;">Go to Storyteller Dashboard</a>
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
        replyTo: applicantEmail,
      });
    } catch (emailError) {
      console.error('Failed to send admin notification email:', emailError);
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
