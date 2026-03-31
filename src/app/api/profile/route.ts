import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth'

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('amori-token')?.value
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const body = await request.json()
    const { name, age, gender, bio, location, occupation, interests, lookingFor, maxDistance, ageRangeMin, ageRangeMax, avatar } = body

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (age !== undefined) updateData.age = parseInt(age) || 0
    if (gender !== undefined) updateData.gender = gender
    if (bio !== undefined) updateData.bio = bio
    if (location !== undefined) updateData.location = location
    if (occupation !== undefined) updateData.occupation = occupation
    if (interests !== undefined) updateData.interests = interests // Supabase handles arrays natively
    if (lookingFor !== undefined) updateData.lookingFor = lookingFor
    if (maxDistance !== undefined) updateData.maxDistance = parseInt(maxDistance) || 50
    if (ageRangeMin !== undefined) updateData.ageRangeMin = parseInt(ageRangeMin) || 18
    if (ageRangeMax !== undefined) updateData.ageRangeMax = parseInt(ageRangeMax) || 65
    if (avatar !== undefined) updateData.avatar = avatar

    const { data: user, error } = await supabase
      .from('User')
      .update(updateData)
      .eq('id', payload.userId)
      .select('id, email, name, avatar, age, gender, bio, interests, location, occupation, lookingFor, maxDistance, ageRangeMin, ageRangeMax, isPremium')
      .single()

    if (error || !user) {
      console.error('Profile update error:', error)
      return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
