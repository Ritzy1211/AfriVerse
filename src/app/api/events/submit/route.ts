import { NextRequest, NextResponse } from 'next/server';

interface EventSubmission {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  country: string;
  category: string;
  imageUrl?: string;
  ticketUrl?: string;
  isFree: boolean;
  organizerName: string;
  organizerEmail: string;
  website?: string;
}

// In production, this would save to a database
// For now, we'll simulate a successful submission
export async function POST(request: NextRequest) {
  try {
    const body: EventSubmission = await request.json();

    // Validate required fields
    const requiredFields = ['title', 'description', 'startDate', 'endDate', 'location', 'country', 'category', 'organizerName', 'organizerEmail'];
    const missingFields = requiredFields.filter(field => !body[field as keyof EventSubmission]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      }, { status: 400 });
    }

    // Validate dates
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      return NextResponse.json({
        success: false,
        error: 'Start date cannot be in the past'
      }, { status: 400 });
    }

    if (endDate < startDate) {
      return NextResponse.json({
        success: false,
        error: 'End date cannot be before start date'
      }, { status: 400 });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.organizerEmail)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email address'
      }, { status: 400 });
    }

    // Validate URLs if provided
    if (body.imageUrl && !isValidUrl(body.imageUrl)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid image URL'
      }, { status: 400 });
    }

    if (body.ticketUrl && !isValidUrl(body.ticketUrl)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid ticket URL'
      }, { status: 400 });
    }

    if (body.website && !isValidUrl(body.website)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid website URL'
      }, { status: 400 });
    }

    // Generate a unique ID for the submission
    const submissionId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // In production, you would:
    // 1. Save the event to a database with status 'pending'
    // 2. Send a confirmation email to the organizer
    // 3. Notify admins about the new submission
    
    // For now, we'll log the submission and return success
    console.log('Event submission received:', {
      id: submissionId,
      ...body,
      submittedAt: new Date().toISOString(),
      status: 'pending_review'
    });

    // Optionally send notification email (if SendGrid is configured)
    try {
      const adminEmail = process.env.ADMIN_EMAIL || process.env.CONTACT_NOTIFICATION_EMAIL;
      if (adminEmail && process.env.SENDGRID_API_KEY) {
        // Send notification to admin
        await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: adminEmail }] }],
            from: { 
              email: process.env.SENDGRID_FROM_EMAIL || 'noreply@afriverse.africa',
              name: 'AfriVerse Events'
            },
            subject: `New Event Submission: ${body.title}`,
            content: [{
              type: 'text/html',
              value: `
                <h2>New Event Submission</h2>
                <p><strong>Title:</strong> ${body.title}</p>
                <p><strong>Category:</strong> ${body.category}</p>
                <p><strong>Date:</strong> ${body.startDate} to ${body.endDate}</p>
                <p><strong>Location:</strong> ${body.location}, ${body.country}</p>
                <p><strong>Description:</strong> ${body.description}</p>
                <p><strong>Organizer:</strong> ${body.organizerName} (${body.organizerEmail})</p>
                <p><strong>Free Event:</strong> ${body.isFree ? 'Yes' : 'No'}</p>
                ${body.website ? `<p><strong>Website:</strong> ${body.website}</p>` : ''}
                ${body.ticketUrl ? `<p><strong>Tickets:</strong> ${body.ticketUrl}</p>` : ''}
                <hr>
                <p>Review and approve this event in the admin dashboard.</p>
              `
            }]
          })
        });
      }
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError);
      // Don't fail the submission if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Event submitted successfully! Our team will review it within 24-48 hours.',
      submissionId
    });

  } catch (error) {
    console.error('Event submission error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to submit event. Please try again.'
    }, { status: 500 });
  }
}

function isValidUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
