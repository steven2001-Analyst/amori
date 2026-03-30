import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('amori-token')?.value
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread') === 'true'

    const notifications = await db.notification.findMany({
      where: {
        userId: payload.userId,
        ...(unreadOnly ? { read: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Notifications error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
