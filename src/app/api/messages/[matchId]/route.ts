import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: Promise<{ matchId: string }> }) {
  try {
    const { matchId } = await params
    const token = request.cookies.get('amori-token')?.value
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const match = await db.match.findUnique({
      where: { id: matchId },
    })

    if (!match) return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    if (match.user1Id !== payload.userId && match.user2Id !== payload.userId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const otherUserId = match.user1Id === payload.userId ? match.user2Id : match.user1Id
    const otherUser = await db.user.findUnique({
      where: { id: otherUserId },
      select: { id: true, name: true, avatar: true, age: true, isOnline: true },
    })

    // Mark messages as read
    await db.message.updateMany({
      where: { matchId, senderId: otherUserId, read: false },
      data: { read: true },
    })

    const messages = await db.message.findMany({
      where: { matchId },
      orderBy: { createdAt: 'asc' },
      select: { id: true, senderId: true, content: true, type: true, read: true, createdAt: true },
    })

    return NextResponse.json({ messages, otherUser, match })
  } catch (error) {
    console.error('Messages GET error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ matchId: string }> }) {
  try {
    const { matchId } = await params
    const token = request.cookies.get('amori-token')?.value
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const match = await db.match.findUnique({ where: { id: matchId } })
    if (!match) return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    if (match.user1Id !== payload.userId && match.user2Id !== payload.userId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const body = await request.json()
    const { content, type = 'text' } = body

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
    }

    const message = await db.message.create({
      data: {
        matchId,
        senderId: payload.userId,
        content: content.trim(),
        type,
      },
    })

    // Create notification for the other user
    const otherUserId = match.user1Id === payload.userId ? match.user2Id : match.user1Id
    await db.notification.create({
      data: {
        userId: otherUserId,
        type: 'message',
        title: 'New message',
        body: content.trim().substring(0, 100),
        fromUserId: payload.userId,
      },
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('Messages POST error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
