import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('amori-token')?.value
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { ageRangeMin: true, ageRangeMax: true, maxDistance: true, gender: true, interests: true },
    })

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const existingMatches = await db.match.findMany({
      where: {
        OR: [{ user1Id: payload.userId }, { user2Id: payload.userId }],
      },
      select: { user1Id: true, user2Id: true },
    })

    const swipedUserIds = new Set(existingMatches.map((m) =>
      m.user1Id === payload.userId ? m.user2Id : m.user1Id
    ))

    const userInterests: string[] = Array.isArray(user.interests) ? user.interests : []

    let users = await db.user.findMany({
      where: {
        id: { not: payload.userId },
        age: { gte: user.ageRangeMin, lte: user.ageRangeMax },
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        age: true,
        gender: true,
        bio: true,
        interests: true,
        location: true,
        occupation: true,
        lookingFor: true,
        photos: { select: { id: true, url: true, order: true, isProfile: true } },
      },
      take: 30,
    })

    users = users.filter((u) => !swipedUserIds.has(u.id))

    users = users.map((u) => ({
      ...u,
      interests: Array.isArray(u.interests) ? u.interests : [],
    }))

    return NextResponse.json(users)
  } catch (error) {
    console.error('Discover error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
