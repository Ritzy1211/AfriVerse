import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { sendEmail, getWriterOnboardingEmailHtml } from '@/lib/email';

// GET - List all users (admin only)
export async function GET() {
  const session = await auth();

  if (!session?.user || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        bio: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST - Create new user (admin only)
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { email, name, password, role, bio } = body;

    // Validate required fields
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Email, name, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Only SUPER_ADMIN can create other admins
    if (role === 'SUPER_ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Only Super Admins can create Super Admin accounts' },
        { status: 403 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role || 'AUTHOR',
        bio,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // Send welcome email with login credentials
    try {
      const welcomeHtml = getWriterOnboardingEmailHtml(name, email, password, role || 'AUTHOR');
      await sendEmail({
        to: email,
        subject: `Welcome to AfriVerse Newsroom - Your Account is Ready!`,
        html: welcomeHtml,
      });
      console.log(`Welcome email sent to ${email}`);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the user creation if email fails
    }

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

// PUT - Update user (admin only)
export async function PUT(request: NextRequest) {
  const session = await auth();

  if (!session?.user || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, email, name, password, role, bio } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (password) updateData.password = await bcrypt.hash(password, 12);

    // Role change permissions:
    // - SUPER_ADMIN can change any role
    // - ADMIN can change roles except to SUPER_ADMIN
    if (role) {
      if (session.user.role === 'SUPER_ADMIN') {
        updateData.role = role;
      } else if (session.user.role === 'ADMIN' && role !== 'SUPER_ADMIN') {
        updateData.role = role;
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        bio: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE - Delete user (SUPER_ADMIN only)
export async function DELETE(request: NextRequest) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Prevent self-deletion
    if (id === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
