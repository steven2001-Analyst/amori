import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('amori-token')?.value
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const body = await request.json()
    const { name, age, gender, bio, location, occupation, interests, lookingFor, maxDistance, ageRangeMin, ageRangeMax } = body

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (age !== undefined) updateData.age = parseInt(age) || 0
    if (gender !== undefined) updateData.gender = gender
    if (bio !== undefined) updateData.bio = bio
    if (location !== undefined) updateData.location = location
    if (occupation !== undefined) updateData.occupation = occupation
    if (interests !== undefined) updateData.interests = JSON.stringify(interests)
    if (lookingFor !== undefined) updateData.lookingFor = lookingFor
    if (maxDistance !== undefined) updateData.maxDistance = parseInt(maxDistance) || 50
    if (ageRangeMin !== undefined) updateData.ageRangeMin = parseInt(ageRangeMin) || 18
    if (ageRangeMax !== undefined) updateData.ageRangeMax = parseInt(ageRangeMax) || 65

    const user = await db.user.update({
      where: { id: payload.userId },
      data: updateData,
      select: {
        id: true, email: true, name: true, avatar: true, age: true, gender: true,
        bio: true, interests: true, location: true, occupation: true,
        lookingFor: true, maxDistance: true, ageRangeMin: true, ageRangeMax: true,
        isPremium: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
