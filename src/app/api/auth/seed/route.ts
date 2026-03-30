import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';

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
    const { data: existing, error: existingError } = await supabase
      .from('User')
      .select('*')
      .eq('email', adminEmail)
      .single();

    if (existing) {
      return NextResponse.json({ success: true, message: 'Admin user already exists' });
    }

    // Create admin user with properly hashed password
    const passwordHash = await hashPassword(adminPassword);

    const { error: createError } = await supabase
      .from('User')
      .insert({
        name: 'Admin',
        email: adminEmail,
        passwordHash,
        role: 'admin',
        avatarColor: '#10b981',
        joinedDate: new Date().toISOString().split('T')[0],
      });

    if (createError) {
      console.error('Admin user creation error:', createError);
      return NextResponse.json({ success: false, error: 'Failed to create admin user' }, { status: 500 });
    }

    // Fetch the created admin to get the ID
    const { data: adminUser } = await supabase
      .from('User')
      .select('*')
      .eq('email', adminEmail)
      .single();

    if (adminUser) {
      // Create progress record for the admin
      await supabase.from('UserProgress').insert({
        userId: adminUser.id,
        completedTopics: '[]',
        streak: 0,
        xp: 0,
        level: 1,
        quizHighScore: 0,
        totalStudyMinutes: 0,
      });
    }

    return NextResponse.json({ success: true, message: 'Admin user seeded successfully' });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
