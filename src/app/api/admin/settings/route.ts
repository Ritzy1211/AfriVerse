import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath, revalidateTag } from 'next/cache';

// GET - Fetch all settings or settings by category
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const where = category ? { category } : {};
    
    const settings = await prisma.siteSetting.findMany({
      where,
      orderBy: { key: 'asc' },
    });

    // Convert to key-value object for easier consumption
    const settingsObject: Record<string, any> = {};
    for (const setting of settings) {
      try {
        settingsObject[setting.key] = JSON.parse(setting.value);
      } catch {
        settingsObject[setting.key] = setting.value;
      }
    }

    return NextResponse.json(settingsObject);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// POST - Save settings (upsert multiple)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { category, settings } = body;

    if (!category || !settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Category and settings object are required' },
        { status: 400 }
      );
    }

    // Upsert each setting
    const upsertPromises = Object.entries(settings).map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: {
          category_key: { category, key },
        },
        update: {
          value: JSON.stringify(value),
        },
        create: {
          category,
          key,
          value: JSON.stringify(value),
        },
      })
    );

    await Promise.all(upsertPromises);

    // Revalidate all pages so appearance/settings changes reflect immediately
    revalidateTag('settings');
    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true, message: 'Settings saved successfully' });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}
