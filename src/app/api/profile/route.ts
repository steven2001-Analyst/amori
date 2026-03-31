import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    const body = await request.json()
    const allowed = ['name', 'bio', 'age', 'gender', 'interests', 'location', 'occupation', 'lookingFor', 'maxDistance', 'ageRangeMin', 'ageRangeMax', 'avatar']
    const updates: Record<string, any> = {}
    for (const key of allowed) { if (body[key] !== undefined) updates[key] = body[key] }
    if (Object.keys(updates).length === 0) return NextResponse.json({ error: 'No fields to update' }, { status: 400 })

    updates.updatedAt = new Date().toISOString()

    const { data, error } = await supabase.from('User').update(updates).eq('id', session.userId).select().single()
    if (error) { console.error('Profile update error:', error); return NextResponse.json({ error: 'Failed to update' }, { status: 500 }) }
    const interests: string[] = Array.isArray(data.interests) ? data.interests : []
    return NextResponse.json({
      id: data.id, email: data.email, name: data.name, avatar: data.avatar, age: data.age, gender: data.gender,
      bio: data.bio, interests, location: data.location, occupation: data.occupation, lookingFor: data.lookingFor,
      isPremium: data.isPremium, isOnline: data.isOnline, maxDistance: data.maxDistance, ageRangeMin: data.ageRangeMin, ageRangeMax: data.ageRangeMax,
      onboarded: !!(data.age && data.gender && interests.length > 0),
    })
  } catch (error) { console.error('Profile error:', error); return NextResponse.json({ error: 'Something went wrong' }, { status: 500 }) }
}
