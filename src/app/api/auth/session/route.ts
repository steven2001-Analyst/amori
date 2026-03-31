import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { data: user, error } = await supabase.from('User').select('*').eq('id', session.userId).single()
    if (error || !user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const interests: string[] = Array.isArray(user.interests) ? user.interests : []
    return NextResponse.json({
      id: user.id, email: user.email, name: user.name, avatar: user.avatar, age: user.age, gender: user.gender,
      bio: user.bio, interests, location: user.location, occupation: user.occupation, lookingFor: user.lookingFor,
      isPremium: user.isPremium, isOnline: user.isOnline, maxDistance: user.maxDistance, ageRangeMin: user.ageRangeMin, ageRangeMax: user.ageRangeMax,
      onboarded: !!(user.age && user.gender && interests.length > 0),
    })
  } catch (error) { console.error('Session error:', error); return NextResponse.json({ error: 'Something went wrong' }, { status: 500 }) }
}
