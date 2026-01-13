import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
const apiKey = process.env.SENDGRID_API_KEY;
if (apiKey) {
  sgMail.setApiKey(apiKey);
}

const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'tips@afriverse.africa';
const fromName = process.env.SENDGRID_FROM_NAME || 'AfriVerse';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, html, text, replyTo }: SendEmailOptions) {
  if (!apiKey) {
    console.warn('SENDGRID_API_KEY not set. Email not sent.');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const msg = {
      to: Array.isArray(to) ? to : [to],
      from: {
        email: fromEmail,
        name: fromName,
      },
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for plain text version
      replyTo: replyTo || fromEmail,
    };

    const response = await sgMail.send(msg);
    console.log('Email sent successfully to:', to);
    return { success: true, messageId: response[0]?.headers?.['x-message-id'] };
  } catch (error: any) {
    console.error('Failed to send email:', error?.response?.body || error.message);
    throw error;
  }
}

// Placeholder functions for compatibility (SendGrid doesn't have built-in audience management)
export async function addContactToAudience(email: string, firstName?: string, lastName?: string) {
  // SendGrid uses Marketing Campaigns for contact management
  // This would require additional setup with SendGrid Marketing API
  console.log('Contact added locally:', email, firstName, lastName);
  return { success: true };
}

export async function removeContactFromAudience(email: string) {
  console.log('Contact removal requested:', email);
  return { success: true };
}

// Send bulk newsletter to all subscribers
export async function sendBulkNewsletter(
  subject: string,
  html: string,
  emails: string[]
) {
  if (!emails.length) {
    return { success: false, error: 'No recipients provided' };
  }

  if (!apiKey) {
    console.warn('SENDGRID_API_KEY not set. Bulk email not sent.');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    // SendGrid recommends using personalizations for bulk sending
    // For large lists, batch them in groups of 1000 (SendGrid limit)
    const batchSize = 1000;
    const results = [];

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      
      const msg = {
        personalizations: batch.map(email => ({ to: [{ email }] })),
        from: { email: fromEmail, name: fromName },
        subject,
        html,
      };

      try {
        await sgMail.send(msg);
        results.push({ batch: i / batchSize + 1, success: true });
      } catch (error: any) {
        console.error('Batch send error:', error?.response?.body || error.message);
        results.push({ batch: i / batchSize + 1, error: error.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    return {
      success: successCount > 0,
      totalBatches: results.length,
      successfulBatches: successCount,
      results,
    };
  } catch (error) {
    console.error('Failed to send bulk newsletter:', error);
    throw error;
  }
}

// Welcome email template
export function getWelcomeEmailHtml(name?: string): string {
  const displayName = name || 'there';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://afriverse.africa';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to AfriVerse!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #1A1A2E 0%, #16213E 100%); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; color: #F39C12; font-size: 32px; font-weight: bold;">AfriVerse</h1>
        <p style="margin: 10px 0 0 0; color: #00D9FF; font-size: 14px;">Your Voice, Your Stories, Your Africa</p>
      </td>
    </tr>
    
    <!-- Content -->
    <tr>
      <td style="padding: 40px 30px;">
        <h2 style="margin: 0 0 20px 0; color: #1A1A2E; font-size: 24px;">Welcome, ${displayName}! 🎉</h2>
        
        <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
          Thank you for subscribing to the AfriVerse newsletter! You've just joined Africa's most vibrant community of curious minds.
        </p>
        
        <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
          Here's what you can expect from us:
        </p>
        
        <ul style="margin: 0 0 30px 0; padding-left: 20px; color: #4a5568; font-size: 16px; line-height: 1.8;">
          <li><strong>Weekly digests</strong> of our best stories from across Africa</li>
          <li><strong>Breaking news</strong> that matters to the continent</li>
          <li><strong>Exclusive insights</strong> on tech, business, culture & more</li>
          <li><strong>Community highlights</strong> featuring African voices</li>
        </ul>
        
        <!-- CTA Button -->
        <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
          <tr>
            <td style="background: linear-gradient(135deg, #F39C12 0%, #E67E22 100%); border-radius: 8px;">
              <a href="${siteUrl}" style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">
                Start Reading →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    
    <!-- Categories -->
    <tr>
      <td style="padding: 0 30px 40px 30px;">
        <p style="margin: 0 0 15px 0; color: #1A1A2E; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
          Explore Our Categories
        </p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding: 8px 0;"><a href="${siteUrl}/tech" style="color: #00D9FF; text-decoration: none;">💻 Technology</a></td>
            <td style="padding: 8px 0;"><a href="${siteUrl}/business" style="color: #00D9FF; text-decoration: none;">💼 Business</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><a href="${siteUrl}/culture" style="color: #00D9FF; text-decoration: none;">🎭 Culture</a></td>
            <td style="padding: 8px 0;"><a href="${siteUrl}/sports" style="color: #00D9FF; text-decoration: none;">⚽ Sports</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><a href="${siteUrl}/politics" style="color: #00D9FF; text-decoration: none;">🏛️ Politics</a></td>
            <td style="padding: 8px 0;"><a href="${siteUrl}/lifestyle" style="color: #00D9FF; text-decoration: none;">✨ Lifestyle</a></td>
          </tr>
        </table>
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="background-color: #1A1A2E; padding: 30px; text-align: center;">
        <p style="margin: 0 0 10px 0; color: #9ca3af; font-size: 14px;">
          Follow us on social media
        </p>
        <p style="margin: 0 0 20px 0;">
          <a href="https://x.com/afriverse1" style="color: #00D9FF; text-decoration: none; margin: 0 10px;">Twitter/X</a>
          <a href="https://instagram.com/officialafriverse" style="color: #00D9FF; text-decoration: none; margin: 0 10px;">Instagram</a>
        </p>
        <p style="margin: 0; color: #6b7280; font-size: 12px;">
          © ${new Date().getFullYear()} AfriVerse. All rights reserved.<br>
          <a href="${siteUrl}/unsubscribe" style="color: #6b7280;">Unsubscribe</a> | 
          <a href="${siteUrl}/privacy" style="color: #6b7280;">Privacy Policy</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Notification email for new comment
export function getNewCommentNotificationHtml(articleTitle: string, commenterName: string, commentContent: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://afriverse.africa';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Comment on AfriVerse</title>
</head>
<body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
    <tr>
      <td style="background-color: #1A1A2E; padding: 20px; text-align: center;">
        <h1 style="margin: 0; color: #F39C12; font-size: 24px;">AfriVerse</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px;">
        <h2 style="margin: 0 0 20px 0; color: #1A1A2E;">New Comment Received 💬</h2>
        <p style="color: #4a5568; margin: 0 0 10px 0;"><strong>Article:</strong> ${articleTitle}</p>
        <p style="color: #4a5568; margin: 0 0 10px 0;"><strong>From:</strong> ${commenterName}</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #4a5568; margin: 0; font-style: italic;">"${commentContent}"</p>
        </div>
        <a href="${siteUrl}/admin/comments" style="display: inline-block; background-color: #F39C12; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Review Comment
        </a>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
