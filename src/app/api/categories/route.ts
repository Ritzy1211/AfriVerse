import { NextResponse } from 'next/server';
import { categories } from '@/data/categories';

// GET /api/categories - Get all categories
export async function GET() {
  try {
    // Return categories from static data
    // Map to include id for compatibility with forms
    const formattedCategories = categories.map(cat => ({
      id: cat.slug, // Use slug as ID for form submissions
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      color: cat.color,
      icon: cat.icon,
    }));

    return NextResponse.json(formattedCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
