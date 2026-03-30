import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';

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
    const { data: existingUser, error: existingError } = await supabase
      .from('User')
      .select('*')
      .eq('email', normalizedEmail)
      .single();

    if (existingUser) {
      return NextResponse.json({ success: false, error: 'An account with this email already exists.' }, { status: 409 });
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const avatarColors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'];
    const avatarColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

    const { data: user, error: createError } = await supabase
      .from('User')
      .insert({
        name: normalizedName,
        email: normalizedEmail,
        passwordHash,
        avatarColor,
        joinedDate: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (createError || !user) {
      console.error('User creation error:', createError);
      return NextResponse.json({ success: false, error: 'Failed to create user.' }, { status: 500 });
    }

    // Create progress record for the user
    await supabase.from('UserProgress').insert({
      userId: user.id,
      completedTopics: '[]',
      streak: 0,
      xp: 0,
      level: 1,
      quizHighScore: 0,
      totalStudyMinutes: 0,
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
  }
}
