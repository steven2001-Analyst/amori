import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

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

    const users = await prisma.user.findMany({
      include: {
        progress: { select: { xp: true, level: true, streak: true, quizHighScore: true } },
        payments: { select: { plan: true, amount: true, status: true, createdAt: true } },
        posts: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const userList = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatarColor: u.avatarColor,
      joinedDate: u.joinedDate,
      isActive: u.isActive,
      plan: u.payments.length > 0 ? u.payments[u.payments.length - 1].plan : 'free',
      xp: u.progress?.xp || 0,
      level: u.progress?.level || 1,
      streak: u.progress?.streak || 0,
      posts: u.posts.length,
      payments: u.payments.length,
    }));

    const stats = {
      totalUsers: await prisma.user.count(),
      totalPosts: await prisma.communityPost.count(),
      totalPayments: await prisma.payment.count(),
      activeToday: await prisma.user.count({
        where: {
          progress: { lastStudyDate: new Date().toISOString().split('T')[0] },
        },
      }),
    };

    return NextResponse.json({ success: true, users: userList, stats });
  } catch (error) {
    console.error('Admin users GET error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
