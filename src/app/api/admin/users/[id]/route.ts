import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// Helper to validate MongoDB ObjectID
function isValidObjectId(id: string): boolean {
  return /^[a-fA-F0-9]{24}$/.test(id);
}

// GET - Get a single user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Validate ObjectID format
  if (!isValidObjectId(params.id)) {
    return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

// PUT - Update a user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Validate ObjectID format
  if (!isValidObjectId(params.id)) {
    return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { email, name, password, role, bio, image } = body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only SUPER_ADMIN can change roles to/from SUPER_ADMIN or ADMIN
    if (role && role !== existingUser.role) {
      if (session.user.role !== 'SUPER_ADMIN') {
        if (role === 'SUPER_ADMIN' || role === 'ADMIN' || 
            existingUser.role === 'SUPER_ADMIN' || existingUser.role === 'ADMIN') {
          return NextResponse.json(
            { error: 'Only Super Admins can modify admin roles' },
            { status: 403 }
          );
        }
      }
      
      // Prevent demoting the last SUPER_ADMIN
      if (existingUser.role === 'SUPER_ADMIN' && role !== 'SUPER_ADMIN') {
        const superAdminCount = await prisma.user.count({
          where: { role: 'SUPER_ADMIN' },
        });
        if (superAdminCount <= 1) {
          return NextResponse.json(
            { error: 'Cannot demote the last Super Admin' },
            { status: 400 }
          );
        }
      }
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email },
      });
      if (emailTaken) {
        return NextResponse.json(
          { error: 'Email is already in use' },
          { status: 400 }
        );
      }
    }

    // Build update data
    const updateData: any = {};
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (role) updateData.role = role;
    if (bio !== undefined) updateData.bio = bio;
    if (image !== undefined) updateData.image = image;

    // Hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE - Delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized - Super Admin only' }, { status: 401 });
  }

  // Validate ObjectID format
  if (!isValidObjectId(params.id)) {
    return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
  }

  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent self-deletion
    if (existingUser.id === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 400 }
      );
    }

    // Prevent deleting the last SUPER_ADMIN
    if (existingUser.role === 'SUPER_ADMIN') {
      const superAdminCount = await prisma.user.count({
        where: { role: 'SUPER_ADMIN' },
      });
      if (superAdminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot delete the last Super Admin' },
          { status: 400 }
        );
      }
    }

    // Delete user (this will cascade delete related records based on schema)
    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
