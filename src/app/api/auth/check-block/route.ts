import { NextRequest, NextResponse } from 'next/server';
import { isIPBlocked, getRemainingLockoutTime } from '@/lib/security';
import { headers } from 'next/headers';

// GET /api/auth/check-block
// Check if the current IP is blocked due to too many failed login attempts
export async function GET(request: NextRequest) {
  try {
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const ip = forwardedFor?.split(',')[0]?.trim() || 
               headersList.get('x-real-ip') || 
               '127.0.0.1';

    const blocked = await isIPBlocked(ip);
    const remainingMinutes = blocked ? await getRemainingLockoutTime(ip) : 0;

    return NextResponse.json({
      blocked,
      remainingMinutes,
    });
  } catch (error) {
    console.error('Failed to check block status:', error);
    return NextResponse.json({
      blocked: false,
      remainingMinutes: 0,
    });
  }
}
