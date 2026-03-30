import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

// GET - fetch user progress from database
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

    const progress = await prisma.userProgress.findUnique({
      where: { userId: payload.userId },
    });

    const studyDates = await prisma.studyDate.findMany({
      where: { userId: payload.userId },
      orderBy: { date: 'asc' },
    });

    if (!progress) {
      return NextResponse.json({
        success: true,
        data: {
          completedTopics: [],
          streak: 0,
          lastStudyDate: null,
          xp: 0,
          level: 1,
          quizHighScore: 0,
          totalStudyMinutes: 0,
          studyDates: [],
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        completedTopics: JSON.parse(progress.completedTopics || '[]'),
        streak: progress.streak,
        lastStudyDate: progress.lastStudyDate,
        xp: progress.xp,
        level: progress.level,
        quizHighScore: progress.quizHighScore,
        totalStudyMinutes: progress.totalStudyMinutes,
        studyDates: studyDates.map((d) => d.date),
      },
    });
  } catch (error) {
    console.error('Progress GET error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - sync progress from client to database
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(authHeader.slice(7));
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { completedTopics, streak, lastStudyDate, xp, level, quizHighScore, totalStudyMinutes, studyDates } = body;

    // Upsert progress
    await prisma.userProgress.upsert({
      where: { userId: payload.userId },
      update: {
        completedTopics: JSON.stringify(completedTopics || []),
        streak: streak ?? 0,
        lastStudyDate: lastStudyDate || null,
        xp: xp ?? 0,
        level: level ?? 1,
        quizHighScore: quizHighScore ?? 0,
        totalStudyMinutes: totalStudyMinutes ?? 0,
      },
      create: {
        userId: payload.userId,
        completedTopics: JSON.stringify(completedTopics || []),
        streak: streak ?? 0,
        lastStudyDate: lastStudyDate || null,
        xp: xp ?? 0,
        level: level ?? 1,
        quizHighScore: quizHighScore ?? 0,
        totalStudyMinutes: totalStudyMinutes ?? 0,
      },
    });

    // Sync study dates (delete old, insert new)
    if (Array.isArray(studyDates) && studyDates.length > 0) {
      await prisma.studyDate.deleteMany({ where: { userId: payload.userId } });
      await prisma.studyDate.createMany({
        data: studyDates.map((date: string) => ({ userId: payload.userId, date })),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Progress PUT error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
