import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// Uses shared db instance from @/lib/db

// GET /api/leaderboard - real leaderboard from database
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const payload = await verifyToken(authHeader.slice(7));
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    // Get top users by XP from progress
    const topUsers = await db.userProgress.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, avatarColor: true, joinedDate: true } },
      },
      orderBy: { xp: 'desc' },
      take: 20,
    });

    const leaderboard = topUsers
      .filter((u) => u.xp > 0)
      .map((u, index) => ({
        rank: index + 1,
        name: u.user.name,
        email: u.user.email,
        avatarColor: u.user.avatarColor,
        xp: u.xp,
        level: u.level,
        streak: u.streak,
        isCurrentUser: u.userId === payload.userId,
      }));

    return NextResponse.json({ success: true, leaderboard });
  } catch (error) {
    console.error('Leaderboard GET error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  } finally {
  }
}
