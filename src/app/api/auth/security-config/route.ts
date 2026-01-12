import { NextResponse } from 'next/server';
import { getSecuritySettings } from '@/lib/security';

// GET /api/auth/security-config
// Returns public security settings for the login page
export async function GET() {
  try {
    const settings = await getSecuritySettings();

    // Only return public settings (not secret keys)
    return NextResponse.json({
      enableCaptcha: settings.enableCaptcha,
      captchaType: settings.captchaType === 'recaptcha-v3' ? 'v3' : 'v2',
      recaptchaSiteKey: settings.recaptchaSiteKey, // Site key is public
      maxLoginAttempts: settings.maxLoginAttempts,
      lockoutDuration: settings.lockoutDuration,
    });
  } catch (error) {
    console.error('Failed to get security config:', error);
    return NextResponse.json({
      enableCaptcha: false,
      captchaType: 'v2',
      recaptchaSiteKey: '',
    });
  }
}
