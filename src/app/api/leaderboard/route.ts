import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

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

    // Get top users by XP from progress, with user info
    const { data: topUsers, error } = await supabase
      .from('UserProgress')
      .select('*, User(id, name, email, avatarColor, joinedDate)')
      .order('xp', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Leaderboard query error:', error);
      return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }

    const leaderboard = (topUsers || [])
      .filter((u: any) => u.xp > 0)
      .map((u: any, index: number) => ({
        rank: index + 1,
        name: u.User?.name,
        email: u.User?.email,
        avatarColor: u.User?.avatarColor,
        xp: u.xp,
        level: u.level,
        streak: u.streak,
        isCurrentUser: u.userId === payload.userId,
      }));

    return NextResponse.json({ success: true, leaderboard });
  } catch (error) {
    console.error('Leaderboard GET error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
