import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('amori-token')?.value
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread') === 'true'

    let query = supabase
      .from('Notification')
      .select('*')
      .eq('userId', payload.userId)
      .order('createdAt', { ascending: false })
      .limit(50)

    if (unreadOnly) {
      query = query.eq('read', false)
    }

    const { data: notifications, error } = await query

    if (error) {
      console.error('Notifications error:', error)
      return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
    }

    // Fetch fromUser data for each notification
    const fromUserIds = [...new Set((notifications || []).map((n) => n.fromUserId).filter(Boolean))]
    let usersMap: Record<string, { id: string; name: string; avatar: string | null }> = {}

    if (fromUserIds.length > 0) {
      const { data: users } = await supabase
        .from('User')
        .select('id, name, avatar')
        .in('id', fromUserIds)

      if (users) {
        for (const u of users) {
          usersMap[u.id] = u
        }
      }
    }

    // Format notifications with user relation to match Prisma include shape
    const formatted = (notifications || []).map((n) => ({
      ...n,
      user: n.fromUserId ? usersMap[n.fromUserId] || null : null,
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Notifications error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
