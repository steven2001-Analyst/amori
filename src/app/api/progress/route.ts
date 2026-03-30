import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

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

    const { data: progress, error: progressError } = await supabase
      .from('UserProgress')
      .select('*')
      .eq('userId', payload.userId)
      .single();

    const { data: studyDates, error: datesError } = await supabase
      .from('StudyDate')
      .select('*')
      .eq('userId', payload.userId)
      .order('date', { ascending: true });

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
        studyDates: (studyDates || []).map((d: any) => d.date),
      },
    });
  } catch (error) {
    console.error('Progress GET error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
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

    const progressData = {
      completedTopics: JSON.stringify(completedTopics || []),
      streak: streak ?? 0,
      lastStudyDate: lastStudyDate || null,
      xp: xp ?? 0,
      level: level ?? 1,
      quizHighScore: quizHighScore ?? 0,
      totalStudyMinutes: totalStudyMinutes ?? 0,
    };

    // Upsert progress: check if exists, then update or create
    const { data: existingProgress } = await supabase
      .from('UserProgress')
      .select('*')
      .eq('userId', payload.userId)
      .single();

    if (existingProgress) {
      await supabase
        .from('UserProgress')
        .update(progressData)
        .eq('userId', payload.userId);
    } else {
      await supabase
        .from('UserProgress')
        .insert({ userId: payload.userId, ...progressData });
    }

    // Sync study dates (delete old, insert new)
    if (Array.isArray(studyDates) && studyDates.length > 0) {
      await supabase.from('StudyDate').delete().eq('userId', payload.userId);
      await supabase.from('StudyDate').insert(
        studyDates.map((date: string) => ({ userId: payload.userId, date }))
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Progress PUT error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
