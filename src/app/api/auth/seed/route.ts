import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '@/lib/auth';

const prisma = new PrismaClient();

// Seed the admin user into the database.
// This runs once to migrate the hardcoded admin from localStorage.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret } = body;

    // Simple protection against accidental calls
    if (secret !== 'datatrack-seed-2026') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const adminEmail = 'stevensaleh100@outlook.com';

    // Check if admin already exists
    const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (existing) {
      return NextResponse.json({ success: true, message: 'Admin user already exists' });
    }

    // Create admin user with properly hashed password
    const passwordHash = await hashPassword('datatrack2026');

    await prisma.user.create({
      data: {
        name: 'Steven',
        email: adminEmail,
        passwordHash,
        role: 'admin',
        avatarColor: '#10b981',
        joinedDate: '2025-01-01',
        progress: {
          create: {
            completedTopics: '[]',
            streak: 0,
            xp: 0,
            level: 1,
            quizHighScore: 0,
            totalStudyMinutes: 0,
          },
        },
      },
    });

    return NextResponse.json({ success: true, message: 'Admin user seeded successfully' });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
