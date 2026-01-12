import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

// ============================================
// LOGIN NOTIFICATION SYSTEM
// ============================================

interface LoginInfo {
  userId: string;
  email: string;
  ip: string;
  userAgent: string;
  location?: string;
  timestamp: Date;
  success: boolean;
}

// Parse user agent to get device info
function parseUserAgent(userAgent: string): string {
  if (!userAgent) return 'Unknown Device';
  
  // Simple device detection
  if (userAgent.includes('iPhone')) return 'iPhone';
  if (userAgent.includes('iPad')) return 'iPad';
  if (userAgent.includes('Android')) return 'Android Device';
  if (userAgent.includes('Windows')) return 'Windows PC';
  if (userAgent.includes('Mac')) return 'Mac';
  if (userAgent.includes('Linux')) return 'Linux PC';
  
  return 'Unknown Device';
}

// Get approximate location from IP (using free API)
export async function getLocationFromIP(ip: string): Promise<string> {
  // Skip for localhost/private IPs
  if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return 'Local Network';
  }

  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,city,country`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return `${data.city}, ${data.country}`;
    }
  } catch (error) {
    console.error('Failed to get location from IP:', error);
  }
  
  return 'Unknown Location';
}

// Send login notification email
export async function sendLoginNotificationEmail(
  userEmail: string,
  userName: string,
  loginInfo: {
    ip: string;
    device: string;
    location: string;
    timestamp: Date;
    isNewDevice: boolean;
  }
) {
  const formattedDate = loginInfo.timestamp.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  const subject = loginInfo.isNewDevice 
    ? '🔔 New Login from Unknown Device - AfriVerse'
    : '🔐 New Login to Your Account - AfriVerse';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px;">AfriVerse</h1>
                  <p style="color: #f39c12; margin: 5px 0 0 0; font-size: 14px;">Security Alert</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #333; margin: 0 0 20px 0; font-size: 20px;">
                    ${loginInfo.isNewDevice ? '⚠️ New Device Login Detected' : '✅ Successful Login'}
                  </h2>
                  
                  <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                    Hi ${userName || 'there'},
                  </p>
                  
                  <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                    ${loginInfo.isNewDevice 
                      ? 'We noticed a login to your AfriVerse account from a new device. If this was you, you can ignore this email.'
                      : 'We detected a new login to your AfriVerse account. Here are the details:'
                    }
                  </p>
                  
                  <!-- Login Details Box -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; margin-bottom: 25px;">
                    <tr>
                      <td style="padding: 20px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                              <span style="color: #888; font-size: 14px;">📍 Location</span><br>
                              <span style="color: #333; font-size: 16px; font-weight: 500;">${loginInfo.location}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                              <span style="color: #888; font-size: 14px;">💻 Device</span><br>
                              <span style="color: #333; font-size: 16px; font-weight: 500;">${loginInfo.device}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                              <span style="color: #888; font-size: 14px;">🌐 IP Address</span><br>
                              <span style="color: #333; font-size: 16px; font-weight: 500;">${loginInfo.ip}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0;">
                              <span style="color: #888; font-size: 14px;">🕐 Time</span><br>
                              <span style="color: #333; font-size: 16px; font-weight: 500;">${formattedDate}</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  ${loginInfo.isNewDevice ? `
                  <!-- Warning Box -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px; margin-bottom: 25px;">
                    <tr>
                      <td style="padding: 15px;">
                        <p style="color: #856404; font-size: 14px; margin: 0;">
                          <strong>⚠️ Wasn't you?</strong><br>
                          If you didn't log in, please change your password immediately and contact our support team.
                        </p>
                      </td>
                    </tr>
                  </table>
                  ` : ''}
                  
                  <p style="color: #999; font-size: 14px; line-height: 1.6; margin: 25px 0 0 0;">
                    This is an automated security notification. You're receiving this because login notifications are enabled for your account.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center;">
                  <p style="color: #999; font-size: 12px; margin: 0;">
                    © ${new Date().getFullYear()} AfriVerse. All rights reserved.<br>
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/settings/security" style="color: #f39c12;">Manage Security Settings</a>
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

  try {
    await sendEmail({
      to: userEmail,
      subject,
      html,
    });
    console.log(`Login notification sent to ${userEmail}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to send login notification:', error);
    return { success: false, error };
  }
}

// Check if LoginAttempt model is available (for graceful degradation)
const hasLoginAttemptModel = () => {
  try {
    return 'loginAttempt' in prisma;
  } catch {
    return false;
  }
};

// Record login attempt
export async function recordLoginAttempt(info: LoginInfo) {
  // Skip if model not available
  if (!hasLoginAttemptModel()) {
    console.warn('LoginAttempt model not available. Run: npx prisma generate && npx prisma db push');
    return;
  }
  
  try {
    // @ts-ignore - Model may not be generated yet
    await prisma.loginAttempt.create({
      data: {
        userId: info.success ? info.userId : null,
        email: info.email,
        ipAddress: info.ip,
        userAgent: info.userAgent,
        location: info.location || 'Unknown',
        success: info.success,
        createdAt: info.timestamp,
      },
    });
  } catch (error) {
    console.error('Failed to record login attempt:', error);
  }
}

// Check if device is new (never seen this IP + User-Agent combo)
export async function isNewDevice(userId: string, ip: string, userAgent: string): Promise<boolean> {
  // Skip if model not available
  if (!hasLoginAttemptModel()) {
    return true; // Assume new device if we can't check
  }
  
  try {
    // @ts-ignore - Model may not be generated yet
    const existingLogin = await prisma.loginAttempt.findFirst({
      where: {
        userId,
        ipAddress: ip,
        userAgent,
        success: true,
      },
    });
    return !existingLogin;
  } catch (error) {
    console.error('Failed to check device:', error);
    return true; // Assume new device on error
  }
}

// ============================================
// RECAPTCHA VERIFICATION
// ============================================

export async function verifyRecaptcha(token: string): Promise<{ success: boolean; score?: number; error?: string }> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  
  if (!secretKey) {
    console.warn('RECAPTCHA_SECRET_KEY not set. Skipping verification.');
    return { success: true }; // Skip if not configured
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data = await response.json();
    
    if (data.success) {
      // For reCAPTCHA v3, also check score (0.0 - 1.0, higher is more likely human)
      if (data.score !== undefined && data.score < 0.5) {
        return { success: false, score: data.score, error: 'Low reCAPTCHA score' };
      }
      return { success: true, score: data.score };
    } else {
      return { success: false, error: data['error-codes']?.join(', ') || 'Verification failed' };
    }
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return { success: false, error: 'Verification request failed' };
  }
}

// ============================================
// SECURITY SETTINGS HELPERS
// ============================================

export interface SecuritySettings {
  loginNotifications: boolean;
  enableCaptcha: boolean;
  captchaType: 'recaptcha-v2' | 'recaptcha-v3';
  recaptchaSiteKey: string;
  recaptchaSecretKey: string;
  maxLoginAttempts: number;
  lockoutDuration: number; // in minutes
  sessionTimeout: number; // in minutes
  twoFactorEnabled: boolean;
}

const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  loginNotifications: true,
  enableCaptcha: false,
  captchaType: 'recaptcha-v2',
  recaptchaSiteKey: '',
  recaptchaSecretKey: '',
  maxLoginAttempts: 5,
  lockoutDuration: 30,
  sessionTimeout: 60,
  twoFactorEnabled: false,
};

// Get security settings from database or env
export async function getSecuritySettings(): Promise<SecuritySettings> {
  try {
    // Fetch all security settings from SiteSetting model
    const settings = await prisma.siteSetting.findMany({
      where: { category: 'security' },
    });

    if (settings.length > 0) {
      // Convert key-value pairs to object
      const settingsMap: Record<string, unknown> = {};
      for (const setting of settings) {
        try {
          settingsMap[setting.key] = JSON.parse(setting.value);
        } catch {
          settingsMap[setting.key] = setting.value;
        }
      }

      return {
        loginNotifications: settingsMap.loginNotifications as boolean ?? DEFAULT_SECURITY_SETTINGS.loginNotifications,
        enableCaptcha: settingsMap.enableCaptcha as boolean ?? DEFAULT_SECURITY_SETTINGS.enableCaptcha,
        captchaType: settingsMap.captchaType as 'recaptcha-v2' | 'recaptcha-v3' ?? DEFAULT_SECURITY_SETTINGS.captchaType,
        recaptchaSiteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || settingsMap.recaptchaSiteKey as string || '',
        recaptchaSecretKey: process.env.RECAPTCHA_SECRET_KEY || settingsMap.recaptchaSecretKey as string || '',
        maxLoginAttempts: settingsMap.maxLoginAttempts as number ?? DEFAULT_SECURITY_SETTINGS.maxLoginAttempts,
        lockoutDuration: settingsMap.lockoutDuration as number ?? DEFAULT_SECURITY_SETTINGS.lockoutDuration,
        sessionTimeout: settingsMap.sessionTimeout as number ?? DEFAULT_SECURITY_SETTINGS.sessionTimeout,
        twoFactorEnabled: settingsMap.twoFactorEnabled as boolean ?? DEFAULT_SECURITY_SETTINGS.twoFactorEnabled,
      };
    }
  } catch (error) {
    console.error('Failed to get security settings:', error);
  }

  return {
    ...DEFAULT_SECURITY_SETTINGS,
    recaptchaSiteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
    recaptchaSecretKey: process.env.RECAPTCHA_SECRET_KEY || '',
  };
}

// Save a security setting
export async function saveSecuritySetting(key: string, value: unknown): Promise<boolean> {
  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    
    await prisma.siteSetting.upsert({
      where: {
        category_key: {
          category: 'security',
          key,
        },
      },
      update: {
        value: stringValue,
      },
      create: {
        category: 'security',
        key,
        value: stringValue,
      },
    });
    
    return true;
  } catch (error) {
    console.error(`Failed to save security setting ${key}:`, error);
    return false;
  }
}

// Check if IP is blocked due to too many failed attempts
export async function isIPBlocked(ip: string): Promise<boolean> {
  // Skip if model not available
  if (!hasLoginAttemptModel()) {
    return false;
  }
  
  try {
    const settings = await getSecuritySettings();
    const lockoutTime = new Date(Date.now() - settings.lockoutDuration * 60 * 1000);

    // @ts-ignore - Model may not be generated yet
    const failedAttempts = await prisma.loginAttempt.count({
      where: {
        ipAddress: ip,
        success: false,
        createdAt: { gte: lockoutTime },
      },
    });

    return failedAttempts >= settings.maxLoginAttempts;
  } catch (error) {
    console.error('Failed to check IP block status:', error);
    return false;
  }
}

// Get remaining lockout time in minutes
export async function getRemainingLockoutTime(ip: string): Promise<number> {
  // Skip if model not available
  if (!hasLoginAttemptModel()) {
    return 0;
  }
  
  try {
    const settings = await getSecuritySettings();
    
    // @ts-ignore - Model may not be generated yet
    const lastFailedAttempt = await prisma.loginAttempt.findFirst({
      where: {
        ipAddress: ip,
        success: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!lastFailedAttempt) return 0;

    const lockoutEndTime = new Date(lastFailedAttempt.createdAt.getTime() + settings.lockoutDuration * 60 * 1000);
    const remainingMs = lockoutEndTime.getTime() - Date.now();
    
    return remainingMs > 0 ? Math.ceil(remainingMs / 60000) : 0;
  } catch (error) {
    return 0;
  }
}
