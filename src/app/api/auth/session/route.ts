import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

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
    const { data: user, error: userError } = await supabase
      .from('User')
      .select('*, UserProgress(*)')
      .eq('id', payload.userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const progress = (user.UserProgress as any)?.[0] || null;

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
        xp: progress?.xp || 0,
        level: progress?.level || 1,
        streak: progress?.streak || 0,
      },
    });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
