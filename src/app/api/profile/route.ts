import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    const body = await request.json()
    const allowed = ['name', 'bio', 'age', 'gender', 'interests', 'location', 'occupation', 'lookingFor', 'maxDistance', 'ageRangeMin', 'ageRangeMax']
    const updates: Record<string, any> = {}
    for (const key of allowed) { if (body[key] !== undefined) updates[key] = body[key] }
    if (Object.keys(updates).length === 0) return NextResponse.json({ error: 'No fields to update' }, { status: 400 })

    if (updates.age || updates.gender || (updates.interests && updates.interests.length > 0)) {
      const { data: current } = await supabase.from('User').select('age, gender, interests').eq('id', session.userId).single()
      if (current) {
        const a = updates.age || current.age
        const g = updates.gender || current.gender
        const i = updates.interests || current.interests
        if (a && g && i && i.length > 0) updates.onboarded = true
      }
    }

    const { data, error } = await supabase.from('User').update(updates).eq('id', session.userId).select().single()
    if (error) { console.error('Profile update error:', error); return NextResponse.json({ error: 'Failed to update' }, { status: 500 }) }
    const interests: string[] = Array.isArray(data.interests) ? data.interests : []
    return NextResponse.json({ id: data.id, email: data.email, name: data.name, avatar: data.avatar, age: data.age, gender: data.gender, bio: data.bio, interests, location: data.location, occupation: data.occupation, lookingFor: data.lookingFor, isPremium: data.isPremium, onboarded: data.onboarded })
  } catch (error) { console.error('Profile error:', error); return NextResponse.json({ error: 'Something went wrong' }, { status: 500 }) }
}
