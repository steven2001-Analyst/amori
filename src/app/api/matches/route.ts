import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('amori-token')?.value
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const matches = await db.match.findMany({
      where: {
        type: 'mutual',
        OR: [{ user1Id: payload.userId }, { user2Id: payload.userId }],
      },
      include: {
        user1: { select: { id: true, name: true, avatar: true, age: true, isOnline: true } },
        user2: { select: { id: true, name: true, avatar: true, age: true, isOnline: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { id: true, content: true, senderId: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const formatted = matches.map((match) => {
      const otherUser = match.user1Id === payload.userId ? match.user2 : match.user1
      const lastMessage = match.messages[0] || null
      return {
        id: match.id,
        user: otherUser,
        lastMessage,
        createdAt: match.createdAt,
      }
    })

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Matches error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
