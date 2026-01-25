import { Resend } from 'resend';

// Initialize Resend with API key
const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

// From email - can be "Name <email>" format
const fromEmail = process.env.RESEND_FROM_EMAIL || 'AfriVerse <hello@afriverse.africa>';

// Email assets - hosted on Cloudinary for reliable email display
const EMAIL_ASSETS = {
  // Using URL without version for better email client compatibility
  logo: 'https://res.cloudinary.com/dnlmfuwst/image/upload/afriverse/Afriverse-logo.png',
  // African pattern background (subtle geometric pattern)
  pattern: 'https://res.cloudinary.com/dnlmfuwst/image/upload/afriverse/email-pattern.png',
};

// Brand colors
const COLORS = {
  primary: '#F39C12',      // Gold/Orange
  secondary: '#00D9FF',    // Cyan
  dark: '#1A1A2E',         // Dark navy
  darkAlt: '#16213E',      // Slightly lighter navy
  text: '#4a5568',         // Gray text
  lightText: '#9ca3af',    // Light gray
  white: '#ffffff',
  warning: '#FEF3C7',
  warningText: '#92400E',
};

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, html, text, replyTo }: SendEmailOptions) {
  if (!resend || !apiKey) {
    console.warn('RESEND_API_KEY not set. Email not sent.');
    console.warn('To email:', to);
    console.warn('Subject:', subject);
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const recipients = Array.isArray(to) ? to : [to];
    
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: recipients,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for plain text version
      replyTo: replyTo,
    });

    if (error) {
      console.error('Failed to send email:', error);
      throw new Error(error.message);
    }

    console.log('Email sent successfully to:', to, 'ID:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error: any) {
    console.error('Failed to send email:', error.message);
    throw error;
  }
}

// Resend Audience management
export async function addContactToAudience(email: string, firstName?: string, lastName?: string) {
  if (!resend || !apiKey) {
    console.warn('RESEND_API_KEY not set. Contact not added.');
    return { success: false, error: 'Email service not configured' };
  }

  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!audienceId) {
    console.warn('RESEND_AUDIENCE_ID not set. Contact not added to audience.');
    return { success: true }; // Don't fail the operation
  }

  try {
    const { data, error } = await resend.contacts.create({
      audienceId,
      email,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
    });

    if (error) {
      // Ignore duplicate contact errors
      if (error.message?.includes('already exists')) {
        console.log('Contact already exists in audience:', email);
        return { success: true };
      }
      console.error('Failed to add contact to audience:', error);
      return { success: false, error: error.message };
    }

    console.log('Contact added to audience:', email, 'ID:', data?.id);
    return { success: true, contactId: data?.id };
  } catch (error: any) {
    console.error('Failed to add contact to audience:', error.message);
    return { success: false, error: error.message };
  }
}

export async function removeContactFromAudience(email: string) {
  if (!resend || !apiKey) {
    return { success: false, error: 'Email service not configured' };
  }

  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!audienceId) {
    return { success: true };
  }

  try {
    // First, find the contact by email
    const { data: contacts } = await resend.contacts.list({ audienceId });
    const contact = contacts?.data?.find((c: any) => c.email === email);
    
    if (contact) {
      await resend.contacts.remove({ audienceId, id: contact.id });
      console.log('Contact removed from audience:', email);
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Failed to remove contact from audience:', error.message);
    return { success: false, error: error.message };
  }
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

  if (!resend || !apiKey) {
    console.warn('RESEND_API_KEY not set. Bulk email not sent.');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    // Resend has a limit of 100 emails per batch in the free tier
    // For paid plans, you can increase this
    const batchSize = 50;
    const results = [];

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      
      // Send to each recipient individually in the batch
      const batchPromises = batch.map(async (email) => {
        try {
          const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: email,
            subject,
            html,
          });
          
          if (error) {
            return { email, success: false, error: error.message };
          }
          return { email, success: true, id: data?.id };
        } catch (err: any) {
          return { email, success: false, error: err.message };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Small delay between batches to avoid rate limiting
      if (i + batchSize < emails.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;
    
    console.log(`Bulk newsletter sent: ${successCount} success, ${failedCount} failed`);
    
    return {
      success: successCount > 0,
      total: emails.length,
      successful: successCount,
      failed: failedCount,
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
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f0f23;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0f0f23;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
          
          <!-- Header with Logo and African Pattern -->
          <tr>
            <td style="background: linear-gradient(135deg, ${COLORS.dark} 0%, ${COLORS.darkAlt} 50%, #0E4429 100%); padding: 50px 40px; text-align: center; position: relative;">
              <!-- Decorative circles -->
              <div style="position: absolute; top: -30px; right: -30px; width: 100px; height: 100px; background: rgba(243, 156, 18, 0.1); border-radius: 50%;"></div>
              <div style="position: absolute; bottom: -20px; left: -20px; width: 60px; height: 60px; background: rgba(0, 217, 255, 0.1); border-radius: 50%;"></div>
              
              <!-- Logo -->
              <img src="${EMAIL_ASSETS.logo}" alt="AfriVerse" style="height: 60px; margin-bottom: 15px;" />
              <p style="margin: 0; color: ${COLORS.secondary}; font-size: 14px; letter-spacing: 2px; text-transform: uppercase;">Your Voice, Your Stories, Your Africa</p>
            </td>
          </tr>
          
          <!-- Welcome Banner -->
          <tr>
            <td style="background: linear-gradient(90deg, ${COLORS.primary} 0%, #E67E22 100%); padding: 25px 40px; text-align: center;">
              <h1 style="margin: 0; color: ${COLORS.white}; font-size: 28px; font-weight: 700;">🎉 Welcome to the Family!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 50px 40px;">
              <h2 style="margin: 0 0 20px 0; color: ${COLORS.dark}; font-size: 24px;">Hey ${displayName}!</h2>
              
              <p style="margin: 0 0 25px 0; color: ${COLORS.text}; font-size: 16px; line-height: 1.8;">
                Welcome aboard! You've just joined <strong>Africa's most vibrant community</strong> of curious minds, thought leaders, and change-makers.
              </p>
              
              <p style="margin: 0 0 25px 0; color: ${COLORS.text}; font-size: 16px; line-height: 1.8;">
                Here's what you'll get from us:
              </p>
              
              <!-- Feature List -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 15px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 12px; margin-bottom: 10px;">
                    <table role="presentation" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="width: 50px; text-align: center; font-size: 24px;">📰</td>
                        <td style="color: ${COLORS.text}; font-size: 15px;"><strong>Weekly Digests</strong> - Best stories from across Africa</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td style="height: 10px;"></td></tr>
                <tr>
                  <td style="padding: 15px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 12px;">
                    <table role="presentation" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="width: 50px; text-align: center; font-size: 24px;">⚡</td>
                        <td style="color: ${COLORS.text}; font-size: 15px;"><strong>Breaking News</strong> - Stories that shape the continent</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td style="height: 10px;"></td></tr>
                <tr>
                  <td style="padding: 15px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 12px;">
                    <table role="presentation" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="width: 50px; text-align: center; font-size: 24px;">💡</td>
                        <td style="color: ${COLORS.text}; font-size: 15px;"><strong>Exclusive Insights</strong> - Tech, business, culture & more</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  <td style="background: linear-gradient(135deg, ${COLORS.primary} 0%, #E67E22 100%); border-radius: 50px; box-shadow: 0 8px 25px rgba(243, 156, 18, 0.4);">
                    <a href="${siteUrl}" style="display: inline-block; padding: 18px 45px; color: ${COLORS.white}; text-decoration: none; font-size: 16px; font-weight: bold; letter-spacing: 0.5px;">
                      Start Exploring →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Categories Section -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: ${COLORS.dark}; border-radius: 12px; padding: 25px;">
                <tr>
                  <td style="padding: 25px; text-align: center;">
                    <p style="margin: 0 0 20px 0; color: ${COLORS.primary}; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">
                      Explore Our Categories
                    </p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding: 8px;"><a href="${siteUrl}/tech" style="color: ${COLORS.secondary}; text-decoration: none; font-size: 14px;">💻 Tech</a></td>
                        <td style="padding: 8px;"><a href="${siteUrl}/business" style="color: ${COLORS.secondary}; text-decoration: none; font-size: 14px;">💼 Business</a></td>
                        <td style="padding: 8px;"><a href="${siteUrl}/culture" style="color: ${COLORS.secondary}; text-decoration: none; font-size: 14px;">🎭 Culture</a></td>
                      </tr>
                      <tr>
                        <td style="padding: 8px;"><a href="${siteUrl}/sports" style="color: ${COLORS.secondary}; text-decoration: none; font-size: 14px;">⚽ Sports</a></td>
                        <td style="padding: 8px;"><a href="${siteUrl}/politics" style="color: ${COLORS.secondary}; text-decoration: none; font-size: 14px;">🏛️ Politics</a></td>
                        <td style="padding: 8px;"><a href="${siteUrl}/lifestyle" style="color: ${COLORS.secondary}; text-decoration: none; font-size: 14px;">✨ Lifestyle</a></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: linear-gradient(135deg, ${COLORS.dark} 0%, ${COLORS.darkAlt} 100%); padding: 35px 40px; text-align: center;">
              <p style="margin: 0 0 15px 0; color: ${COLORS.lightText}; font-size: 14px;">
                Follow us for more African stories
              </p>
              <p style="margin: 0 0 20px 0;">
                <a href="https://x.com/afriaborgin" style="color: ${COLORS.secondary}; text-decoration: none; margin: 0 12px; font-size: 14px;">𝕏 Twitter</a>
                <a href="https://instagram.com/afaborgin" style="color: ${COLORS.secondary}; text-decoration: none; margin: 0 12px; font-size: 14px;">📸 Instagram</a>
                <a href="https://facebook.com/afriverse" style="color: ${COLORS.secondary}; text-decoration: none; margin: 0 12px; font-size: 14px;">👥 Facebook</a>
              </p>
              <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; margin-top: 10px;">
                <p style="margin: 0; color: #6b7280; font-size: 12px;">
                  © ${new Date().getFullYear()} AfriVerse. All rights reserved.<br>
                  <a href="${siteUrl}/unsubscribe" style="color: #6b7280;">Unsubscribe</a> · 
                  <a href="${siteUrl}/privacy" style="color: #6b7280;">Privacy Policy</a>
                </p>
              </div>
            </td>
          </tr>
        </table>
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
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f0f23;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0f0f23;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${COLORS.dark} 0%, ${COLORS.darkAlt} 100%); padding: 35px 40px; text-align: center;">
              <img src="${EMAIL_ASSETS.logo}" alt="AfriVerse" style="height: 45px;" />
            </td>
          </tr>
          
          <!-- Notification Banner -->
          <tr>
            <td style="background: linear-gradient(90deg, #10b981 0%, #059669 100%); padding: 18px 40px; text-align: center;">
              <h1 style="margin: 0; color: ${COLORS.white}; font-size: 20px; font-weight: 600;">💬 New Comment Received!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <!-- Article Info -->
              <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 12px; padding: 20px; margin-bottom: 25px;">
                <p style="margin: 0 0 8px 0; color: ${COLORS.lightText}; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Article</p>
                <p style="margin: 0; color: ${COLORS.dark}; font-size: 16px; font-weight: 600;">${articleTitle}</p>
              </div>
              
              <!-- Comment -->
              <div style="border-left: 4px solid ${COLORS.primary}; padding-left: 20px; margin-bottom: 25px;">
                <p style="margin: 0 0 10px 0; color: ${COLORS.dark}; font-size: 14px; font-weight: 600;">
                  <span style="background: linear-gradient(135deg, ${COLORS.primary} 0%, #E67E22 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">@${commenterName}</span> says:
                </p>
                <p style="margin: 0; color: ${COLORS.text}; font-size: 15px; line-height: 1.7; font-style: italic;">
                  "${commentContent}"
                </p>
              </div>
              
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  <td style="background: linear-gradient(135deg, ${COLORS.primary} 0%, #E67E22 100%); border-radius: 50px; box-shadow: 0 8px 25px rgba(243, 156, 18, 0.4);">
                    <a href="${siteUrl}/admin/comments" style="display: inline-block; padding: 15px 40px; color: ${COLORS.white}; text-decoration: none; font-size: 15px; font-weight: bold;">
                      Review Comment →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: ${COLORS.dark}; padding: 25px 40px; text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 11px;">
                © ${new Date().getFullYear()} AfriVerse · Admin Notification
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Writer onboarding email template
export function getWriterOnboardingEmailHtml(name: string, email: string, password: string, role: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://afriverse.africa';
  const roleLabels: Record<string, string> = {
    CONTRIBUTOR: 'Contributor',
    AUTHOR: 'Staff Writer',
    SENIOR_WRITER: 'Senior Writer',
    EDITOR: 'Section Editor',
    ADMIN: 'Managing Editor',
    SUPER_ADMIN: 'Editor-in-Chief',
  };
  const roleLabel = roleLabels[role] || role;
  
  // Role-specific emoji
  const roleEmoji: Record<string, string> = {
    CONTRIBUTOR: '✏️',
    AUTHOR: '📝',
    SENIOR_WRITER: '🖊️',
    EDITOR: '📰',
    ADMIN: '👔',
    SUPER_ADMIN: '👑',
  };
  const emoji = roleEmoji[role] || '✨';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to the AfriVerse Newsroom!</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f0f23;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0f0f23;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
          
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, ${COLORS.dark} 0%, ${COLORS.darkAlt} 50%, #0E4429 100%); padding: 45px 40px; text-align: center;">
              <img src="${EMAIL_ASSETS.logo}" alt="AfriVerse" style="height: 55px; margin-bottom: 12px;" />
              <p style="margin: 0; color: ${COLORS.secondary}; font-size: 13px; letter-spacing: 2px; text-transform: uppercase;">Newsroom Portal</p>
            </td>
          </tr>
          
          <!-- Welcome Banner -->
          <tr>
            <td style="background: linear-gradient(90deg, #8b5cf6 0%, #6366f1 100%); padding: 22px 40px; text-align: center;">
              <h1 style="margin: 0; color: ${COLORS.white}; font-size: 22px; font-weight: 600;">🎊 Welcome to the Team!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 45px 40px;">
              <h2 style="margin: 0 0 20px 0; color: ${COLORS.dark}; font-size: 22px;">
                Hey ${name}! ${emoji}
              </h2>
              
              <p style="margin: 0 0 25px 0; color: ${COLORS.text}; font-size: 16px; line-height: 1.8;">
                Congratulations! You've been invited to join the <strong style="color: ${COLORS.primary};">AfriVerse</strong> editorial team as a <strong>${roleLabel}</strong>. We're thrilled to have you help us tell Africa's stories!
              </p>
              
              <!-- Role Badge -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto 30px auto;">
                <tr>
                  <td style="background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); border-radius: 50px; padding: 12px 30px;">
                    <span style="color: ${COLORS.white}; font-size: 14px; font-weight: 600;">${emoji} ${roleLabel}</span>
                  </td>
                </tr>
              </table>
              
              <!-- Login Credentials Box -->
              <div style="background: linear-gradient(135deg, ${COLORS.dark} 0%, ${COLORS.darkAlt} 100%); border-radius: 16px; padding: 30px; margin-bottom: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                  <tr>
                    <td style="padding-right: 12px;">
                      <span style="font-size: 24px;">🔐</span>
                    </td>
                    <td>
                      <h3 style="margin: 0; color: ${COLORS.primary}; font-size: 16px; font-weight: bold;">Your Login Credentials</h3>
                    </td>
                  </tr>
                </table>
                
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                      <span style="color: ${COLORS.lightText}; font-size: 13px;">Email</span><br>
                      <span style="color: ${COLORS.white}; font-size: 15px; font-weight: 600;">${email}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0;">
                      <span style="color: ${COLORS.lightText}; font-size: 13px;">Temporary Password</span><br>
                      <span style="color: ${COLORS.secondary}; font-size: 15px; font-weight: 600; font-family: monospace; letter-spacing: 1px;">${password}</span>
                    </td>
                  </tr>
                </table>
                
                <div style="background: rgba(243, 156, 18, 0.15); border-radius: 8px; padding: 12px; margin-top: 15px;">
                  <p style="margin: 0; color: ${COLORS.primary}; font-size: 12px;">
                    ⚠️ Please change your password after your first login for security!
                  </p>
                </div>
              </div>
              
              <!-- Features List -->
              <p style="margin: 0 0 20px 0; color: ${COLORS.text}; font-size: 15px; font-weight: 600;">
                As a ${roleLabel}, you'll have access to:
              </p>
              
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 12px 15px; background: #f8f9fa; border-radius: 10px; margin-bottom: 8px;">
                    <span style="font-size: 18px; margin-right: 10px;">📊</span>
                    <span style="color: ${COLORS.text}; font-size: 14px;"><strong>Newsroom Dashboard</strong> - Track your articles & stats</span>
                  </td>
                </tr>
                <tr><td style="height: 8px;"></td></tr>
                <tr>
                  <td style="padding: 12px 15px; background: #f8f9fa; border-radius: 10px;">
                    <span style="font-size: 18px; margin-right: 10px;">✍️</span>
                    <span style="color: ${COLORS.text}; font-size: 14px;"><strong>Article Composer</strong> - Rich text editor with media</span>
                  </td>
                </tr>
                <tr><td style="height: 8px;"></td></tr>
                <tr>
                  <td style="padding: 12px 15px; background: #f8f9fa; border-radius: 10px;">
                    <span style="font-size: 18px; margin-right: 10px;">🖼️</span>
                    <span style="color: ${COLORS.text}; font-size: 14px;"><strong>Media Library</strong> - Upload & manage images</span>
                  </td>
                </tr>
                <tr><td style="height: 8px;"></td></tr>
                <tr>
                  <td style="padding: 12px 15px; background: #f8f9fa; border-radius: 10px;">
                    <span style="font-size: 18px; margin-right: 10px;">💬</span>
                    <span style="color: ${COLORS.text}; font-size: 14px;"><strong>Editorial Notes</strong> - Feedback from editors</span>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  <td style="background: linear-gradient(135deg, ${COLORS.primary} 0%, #E67E22 100%); border-radius: 50px; box-shadow: 0 8px 25px rgba(243, 156, 18, 0.4);">
                    <a href="${siteUrl}/writer/login" style="display: inline-block; padding: 18px 45px; color: ${COLORS.white}; text-decoration: none; font-size: 16px; font-weight: bold; letter-spacing: 0.5px;">
                      🚀 Login to Newsroom
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 25px 0 0 0; color: ${COLORS.lightText}; font-size: 13px; text-align: center;">
                Having trouble? Reply to this email and we'll help you get started.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: linear-gradient(135deg, ${COLORS.dark} 0%, ${COLORS.darkAlt} 100%); padding: 30px 40px; text-align: center;">
              <p style="margin: 0 0 15px 0; color: ${COLORS.lightText}; font-size: 14px;">
                🌍 Welcome to the AfriVerse family!
              </p>
              <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px;">
                <p style="margin: 0; color: #6b7280; font-size: 11px;">
                  © ${new Date().getFullYear()} AfriVerse. All rights reserved.<br>
                  <a href="${siteUrl}/writer/guidelines" style="color: ${COLORS.secondary};">Writer Guidelines</a> · 
                  <a href="${siteUrl}/privacy" style="color: #6b7280;">Privacy Policy</a>
                </p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Password reset email template
export function getPasswordResetEmailHtml(name: string, resetLink: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://afriverse.africa';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - AfriVerse</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f0f23;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0f0f23;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
          
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, ${COLORS.dark} 0%, ${COLORS.darkAlt} 50%, #0E4429 100%); padding: 45px 40px; text-align: center;">
              <!-- Logo -->
              <img src="${EMAIL_ASSETS.logo}" alt="AfriVerse" style="height: 55px; margin-bottom: 12px;" />
              <p style="margin: 0; color: ${COLORS.secondary}; font-size: 13px; letter-spacing: 2px; text-transform: uppercase;">Newsroom Portal</p>
            </td>
          </tr>
          
          <!-- Security Banner -->
          <tr>
            <td style="background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); padding: 20px 40px; text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  <td style="padding-right: 12px;">
                    <span style="font-size: 28px;">🔐</span>
                  </td>
                  <td>
                    <h1 style="margin: 0; color: ${COLORS.white}; font-size: 22px; font-weight: 600;">Password Reset Request</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 45px 40px;">
              <p style="margin: 0 0 25px 0; color: ${COLORS.dark}; font-size: 18px; font-weight: 500;">
                Hi ${name || 'there'},
              </p>
              
              <p style="margin: 0 0 25px 0; color: ${COLORS.text}; font-size: 16px; line-height: 1.8;">
                We received a request to reset the password for your AfriVerse account. Click the button below to create a new password.
              </p>
              
              <!-- Timer Badge -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto 30px auto;">
                <tr>
                  <td style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 50px; padding: 12px 25px;">
                    <span style="color: ${COLORS.warningText}; font-size: 14px; font-weight: 600;">⏱️ This link expires in 1 hour</span>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto 30px auto;">
                <tr>
                  <td style="background: linear-gradient(135deg, ${COLORS.primary} 0%, #E67E22 100%); border-radius: 50px; box-shadow: 0 8px 25px rgba(243, 156, 18, 0.4);">
                    <a href="${resetLink}" style="display: inline-block; padding: 18px 50px; color: ${COLORS.white}; text-decoration: none; font-size: 16px; font-weight: bold; letter-spacing: 0.5px;">
                      🔑 Reset My Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Alternative Link -->
              <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
                <p style="margin: 0 0 10px 0; color: ${COLORS.lightText}; font-size: 13px;">
                  Or copy and paste this link into your browser:
                </p>
                <p style="margin: 0; color: ${COLORS.secondary}; font-size: 12px; word-break: break-all; background: #e9ecef; padding: 12px; border-radius: 8px; font-family: monospace;">
                  ${resetLink}
                </p>
              </div>
              
              <!-- Security Notice -->
              <div style="background: linear-gradient(135deg, ${COLORS.warning} 0%, #fde68a 100%); border-left: 4px solid ${COLORS.primary}; padding: 18px 20px; border-radius: 0 12px 12px 0;">
                <table role="presentation" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding-right: 12px; vertical-align: top;">
                      <span style="font-size: 20px;">⚠️</span>
                    </td>
                    <td>
                      <p style="margin: 0; color: ${COLORS.warningText}; font-size: 14px; line-height: 1.6;">
                        <strong>Didn't request this?</strong><br>
                        If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                      </p>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: linear-gradient(135deg, ${COLORS.dark} 0%, ${COLORS.darkAlt} 100%); padding: 30px 40px; text-align: center;">
              <p style="margin: 0 0 10px 0; color: ${COLORS.lightText}; font-size: 13px;">
                Need help? Contact our support team
              </p>
              <p style="margin: 0 0 15px 0;">
                <a href="mailto:support@afriverse.africa" style="color: ${COLORS.secondary}; text-decoration: none; font-size: 14px;">support@afriverse.africa</a>
              </p>
              <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px;">
                <p style="margin: 0; color: #6b7280; font-size: 11px;">
                  © ${new Date().getFullYear()} AfriVerse. All rights reserved.<br>
                  <a href="${siteUrl}/privacy" style="color: #6b7280;">Privacy Policy</a> · 
                  <a href="${siteUrl}/terms" style="color: #6b7280;">Terms of Service</a>
                </p>
              </div>
            </td>
          </tr>
        </table>
        
        <!-- Security Footer -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin-top: 20px;">
          <tr>
            <td style="text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 11px;">
                🔒 This is an automated security email from AfriVerse
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
