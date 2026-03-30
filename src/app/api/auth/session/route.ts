import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
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

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        age: true,
        gender: true,
        bio: true,
        interests: true,
        location: true,
        occupation: true,
        lookingFor: true,
        maxDistance: true,
        ageRangeMin: true,
        ageRangeMax: true,
        isOnline: true,
        lastSeen: true,
        isPremium: true,
        premiumExpiry: true,
        swipesToday: true,
        swipesResetDate: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const onboarded = !!(user.age && user.gender && user.interests !== '[]')

    return NextResponse.json({ ...user, onboarded })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
