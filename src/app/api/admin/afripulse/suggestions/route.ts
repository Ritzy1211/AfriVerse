import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generateAfriPulseSuggestions, applySuggestion } from '@/lib/afripulse-analyzer';

// GET /api/admin/afripulse/suggestions - Generate AfriPulse suggestions from articles
export async function GET(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    const suggestions = await generateAfriPulseSuggestions(days);

    return NextResponse.json({
      success: true,
      data: suggestions,
      message: `Analyzed ${suggestions.analyzedArticleCount} articles from the last ${days} days`
    });
  } catch (error) {
    console.error('Error generating AfriPulse suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}

// POST /api/admin/afripulse/suggestions - Apply a suggestion
export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { countryCode, scores } = body;

    if (!countryCode) {
      return NextResponse.json(
        { error: 'Country code is required' },
        { status: 400 }
      );
    }

    const updated = await applySuggestion(countryCode, scores);

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Updated ${countryCode} with suggested scores`
    });
  } catch (error) {
    console.error('Error applying suggestion:', error);
    return NextResponse.json(
      { error: 'Failed to apply suggestion' },
      { status: 500 }
    );
  }
}
