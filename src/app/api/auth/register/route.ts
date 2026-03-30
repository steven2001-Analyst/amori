import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

// Uses shared db instance from @/lib/db

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validation
    if (!name?.trim()) {
      return NextResponse.json({ success: false, error: 'Please enter your full name.' }, { status: 400 });
    }
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 });
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();

    // Check if user exists
    const existingUser = await db.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'An account with this email already exists.' }, { status: 409 });
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const avatarColors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'];
    const avatarColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

    const user = await db.user.create({
      data: {
        name: normalizedName,
        email: normalizedEmail,
        passwordHash,
        avatarColor,
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

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarColor: user.avatarColor,
        joinedDate: user.joinedDate,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ success: false, error: 'Server error. Please try again.' }, { status: 500 });
  } finally {
  }
}
