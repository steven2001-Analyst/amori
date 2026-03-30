import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

// Uses shared db instance from @/lib/db

// Seed the admin user into the database.
// This runs once to create the initial admin account.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret } = body;

    // Protection against unauthorized calls — use env variable
    const seedSecret = process.env.SEED_SECRET || 'change-me-in-production';
    if (secret !== seedSecret) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        { success: false, error: 'ADMIN_EMAIL and ADMIN_PASSWORD environment variables must be set' },
        { status: 500 }
      );
    }

    // Check if admin already exists
    const existing = await db.user.findUnique({ where: { email: adminEmail } });
    if (existing) {
      return NextResponse.json({ success: true, message: 'Admin user already exists' });
    }

    // Create admin user with properly hashed password
    const passwordHash = await hashPassword(adminPassword);

    await db.user.create({
      data: {
        name: 'Admin',
        email: adminEmail,
        passwordHash,
        role: 'admin',
        avatarColor: '#10b981',
        joinedDate: new Date().toISOString().split('T')[0],
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
  }
}
