import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

// GET /api/admin/users - real user list for admin panel
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const payload = await verifyToken(authHeader.slice(7));
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const { data: users, error: usersError } = await supabase
      .from('User')
      .select('*, UserProgress(xp, level, streak, quizHighScore), Payment(plan, amount, status, createdAt), CommunityPost(id)')
      .order('createdAt', { ascending: false })
      .limit(50);

    if (usersError) {
      console.error('Admin users query error:', usersError);
      return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }

    const userList = (users || []).map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatarColor: u.avatarColor,
      joinedDate: u.joinedDate,
      isActive: u.isActive,
      plan: (u.Payment || []).length > 0
        ? u.Payment[u.Payment.length - 1].plan
        : 'free',
      xp: u.UserProgress?.[0]?.xp || 0,
      level: u.UserProgress?.[0]?.level || 1,
      streak: u.UserProgress?.[0]?.streak || 0,
      posts: (u.CommunityPost || []).length,
      payments: (u.Payment || []).length,
    }));

    // Fetch stats in parallel
    const today = new Date().toISOString().split('T')[0];

    const [{ count: totalUsers }, { count: totalPosts }, { count: totalPayments }, { data: activeUsers }] =
      await Promise.all([
        supabase.from('User').select('*', { count: 'exact', head: true }),
        supabase.from('CommunityPost').select('*', { count: 'exact', head: true }),
        supabase.from('Payment').select('*', { count: 'exact', head: true }),
        supabase
          .from('UserProgress')
          .select('userId')
          .eq('lastStudyDate', today),
      ]);

    const stats = {
      totalUsers: totalUsers || 0,
      totalPosts: totalPosts || 0,
      totalPayments: totalPayments || 0,
      activeToday: new Set((activeUsers || []).map((u: any) => u.userId)).size,
    };

    return NextResponse.json({ success: true, users: userList, stats });
  } catch (error) {
    console.error('Admin users GET error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
