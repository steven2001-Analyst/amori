import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('amori-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { data: user, error: userError } = await supabase
      .from('User')
      .select('*')
      .eq('id', payload.userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const interests: string[] = Array.isArray(user.interests) ? user.interests : []
    const onboarded = !!(user.age && user.gender && interests.length > 0)

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      age: user.age,
      gender: user.gender,
      bio: user.bio,
      interests,
      location: user.location,
      occupation: user.occupation,
      lookingFor: user.lookingFor,
      maxDistance: user.maxDistance,
      ageRangeMin: user.ageRangeMin,
      ageRangeMax: user.ageRangeMax,
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
      isPremium: user.isPremium,
      premiumExpiry: user.premiumExpiry,
      swipesToday: user.swipesToday,
      swipesResetDate: user.swipesResetDate,
      createdAt: user.createdAt,
      onboarded,
    })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
