import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('amori-token')?.value
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const body = await request.json()
    const { targetUserId, type } = body

    if (!targetUserId || !type || !['liked', 'passed'].includes(type)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    if (targetUserId === payload.userId) {
      return NextResponse.json({ error: 'Cannot swipe on yourself' }, { status: 400 })
    }

    const targetUser = await db.user.findUnique({ where: { id: targetUserId } })
    if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Check if already swiped
    const existing = await db.match.findFirst({
      where: {
        OR: [
          { user1Id: payload.userId, user2Id: targetUserId },
          { user1Id: targetUserId, user2Id: payload.userId },
        ],
      },
    })

    if (existing) {
      return NextResponse.json({ error: 'Already swiped on this user' }, { status: 409 })
    }

    // Check if they liked us
    const reverseSwipe = await db.match.findFirst({
      where: { user1Id: targetUserId, user2Id: payload.userId, type: 'liked' },
    })

    const isMutual = reverseSwipe && type === 'liked'

    if (reverseSwipe && type === 'liked') {
      await db.match.update({
        where: { id: reverseSwipe.id },
        data: { type: 'mutual' },
      })

      // Create notifications for both users
      await db.notification.create({
        data: {
          userId: payload.userId,
          type: 'match',
          title: "It's a match!",
          body: `You and ${targetUser.name} liked each other!`,
          fromUserId: targetUserId,
        },
      })

      await db.notification.create({
        data: {
          userId: targetUserId,
          type: 'match',
          title: "It's a match!",
          body: `You and ${payload.userId === targetUserId ? 'someone' : 'someone'} liked each other!`,
          fromUserId: payload.userId,
        },
      })

      const currentUser = await db.user.findUnique({ where: { id: payload.userId }, select: { name: true } })
      await db.notification.updateMany({
        where: { userId: targetUserId, type: 'match', fromUserId: payload.userId },
        data: { body: `You and ${currentUser?.name || 'Someone'} liked each other!` },
      })
    } else {
      await db.match.create({
        data: {
          user1Id: payload.userId,
          user2Id: targetUserId,
          type,
        },
      })

      if (type === 'liked') {
        await db.notification.create({
          data: {
            userId: targetUserId,
            type: 'like',
            title: 'Someone likes you!',
            body: 'Check discover to see who it is.',
            fromUserId: payload.userId,
          },
        })
      }
    }

    // Update swipe count
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const user = await db.user.findUnique({ where: { id: payload.userId }, select: { swipesResetDate: true, swipesToday: true } })
    
    if (user) {
      const resetDate = new Date(user.swipesResetDate)
      if (resetDate < today) {
        await db.user.update({
          where: { id: payload.userId },
          data: { swipesToday: 1, swipesResetDate: new Date() },
        })
      } else {
        await db.user.update({
          where: { id: payload.userId },
          data: { swipesToday: { increment: 1 } },
        })
      }
    }

    return NextResponse.json({ success: true, isMutual, type })
  } catch (error) {
    console.error('Swipe error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
