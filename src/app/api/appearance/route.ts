import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Default appearance settings
const defaultAppearance = {
  primaryColor: '#1A1A2E',
  secondaryColor: '#F39C12',
  accentColor: '#00D9FF',
  headingFont: 'Plus Jakarta Sans',
  bodyFont: 'Plus Jakarta Sans',
  theme: 'light',
  showTrendingTicker: true,
  showSearchBar: true,
};

// GET /api/appearance - Public endpoint to get appearance settings
export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: { category: 'appearance' },
    });

    // Convert to key-value object
    const appearanceSettings: Record<string, any> = { ...defaultAppearance };
    
    for (const setting of settings) {
      try {
        appearanceSettings[setting.key] = JSON.parse(setting.value);
      } catch {
        appearanceSettings[setting.key] = setting.value;
      }
    }

    // Return with cache headers for performance
    return NextResponse.json(appearanceSettings, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Error fetching appearance settings:', error);
    // Return defaults on error
    return NextResponse.json(defaultAppearance);
  }
}
