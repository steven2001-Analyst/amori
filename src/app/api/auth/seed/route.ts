import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { secret } = await request.json()
    if (secret !== (process.env.SEED_SECRET || 'amori-seed-2026')) return NextResponse.json({ error: 'Invalid secret' }, { status: 403 })

    const pw = await hashPassword('Amori2026!')
    const users = [
      { name: 'Steven', email: 'stevensaleh100@outlook.com', passwordHash: pw, age: 28, gender: 'male', bio: 'Adventure seeker & foodie. Looking for genuine connections.', interests: ['Travel', 'Photography', 'Cooking', 'Fitness'], location: 'New York', occupation: 'Software Engineer', lookingFor: 'relationship', isPremium: true, isOnline: true, swipesToday: 0 },
      { name: 'Emma', email: 'emma@test.com', passwordHash: pw, age: 25, gender: 'female', bio: 'Bookworm by day, salsa dancer by night.', interests: ['Reading', 'Dancing', 'Music', 'Art'], location: 'New York', occupation: 'Designer', lookingFor: 'relationship', isPremium: false, isOnline: true, swipesToday: 0 },
      { name: 'James', email: 'james@test.com', passwordHash: pw, age: 30, gender: 'male', bio: 'Tech entrepreneur who loves hiking and good coffee.', interests: ['Tech', 'Nature', 'Coffee', 'Travel'], location: 'San Francisco', occupation: 'CTO', lookingFor: 'relationship', isPremium: true, isOnline: false, swipesToday: 0 },
      { name: 'Sofia', email: 'sofia@test.com', passwordHash: pw, age: 26, gender: 'female', bio: 'Yoga instructor spreading positive vibes.', interests: ['Yoga', 'Wellness', 'Travel', 'Photography'], location: 'Los Angeles', occupation: 'Yoga Instructor', lookingFor: 'casual', isPremium: false, isOnline: true, swipesToday: 0 },
      { name: 'Alex', email: 'alex@test.com', passwordHash: pw, age: 29, gender: 'male', bio: 'Musician and chef. Life is too short for bad food.', interests: ['Music', 'Cooking', 'Gaming', 'Movies'], location: 'Chicago', occupation: 'Chef', lookingFor: 'relationship', isPremium: false, isOnline: true, swipesToday: 0 },
      { name: 'Mia', email: 'mia@test.com', passwordHash: pw, age: 24, gender: 'female', bio: 'Grad student who loves museums and rainy days.', interests: ['Art', 'Reading', 'Movies', 'Coffee'], location: 'Boston', occupation: 'Student', lookingFor: 'relationship', isPremium: false, isOnline: false, swipesToday: 0 },
      { name: 'Lucas', email: 'lucas@test.com', passwordHash: pw, age: 31, gender: 'male', bio: 'Architect with a passion for sustainable design.', interests: ['Art', 'Nature', 'Photography', 'Travel'], location: 'Seattle', occupation: 'Architect', lookingFor: 'casual', isPremium: true, isOnline: true, swipesToday: 0 },
      { name: 'Olivia', email: 'olivia@test.com', passwordHash: pw, age: 27, gender: 'female', bio: 'Digital nomad exploring the world one city at a time.', interests: ['Travel', 'Photography', 'Fitness', 'Coffee'], location: 'Austin', occupation: 'Marketing', lookingFor: 'relationship', isPremium: false, isOnline: true, swipesToday: 0 },
      { name: 'Noah', email: 'noah@test.com', passwordHash: pw, age: 32, gender: 'male', bio: 'Veterinarian who believes every dog is a good boy.', interests: ['Nature', 'Fitness', 'Cooking', 'Sports'], location: 'Denver', occupation: 'Veterinarian', lookingFor: 'relationship', isPremium: false, isOnline: false, swipesToday: 0 },
    ]

    const { error } = await supabase.from('User').upsert(users, { onConflict: 'email' })
    if (error) { console.error('Seed error:', error); return NextResponse.json({ error: 'Seed failed' }, { status: 500 }) }

    return NextResponse.json({ success: true, seeded: users.length })
  } catch (error) { console.error('Seed error:', error); return NextResponse.json({ error: 'Something went wrong' }, { status: 500 }) }
}
