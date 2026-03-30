import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header or query param (for SSR)
    const authHeader = request.headers.get('authorization');
    const queryToken = request.nextUrl.searchParams.get('token');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : queryToken;

    if (!token) {
      return NextResponse.json({ success: false, error: 'No token provided' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 });
    }

    // Fetch fresh user data
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { progress: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarColor: user.avatarColor,
        profilePicture: user.profilePicture,
        joinedDate: user.joinedDate,
        xp: user.progress?.xp || 0,
        level: user.progress?.level || 1,
        streak: user.progress?.streak || 0,
      },
    });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
