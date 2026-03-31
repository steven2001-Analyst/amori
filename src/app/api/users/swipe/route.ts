import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    const { targetUserId, type } = await request.json()
    if (!targetUserId || !['liked', 'passed'].includes(type)) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    if (targetUserId === session.userId) return NextResponse.json({ error: 'Cannot swipe on yourself' }, { status: 400 })

    const { data: target } = await supabase.from('User').select('id, name').eq('id', targetUserId).single()
    if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { data: existing } = await supabase.from('Match').select('id').or('and(user1Id.eq.' + session.userId + ',user2Id.eq.' + targetUserId + '),and(user1Id.eq.' + targetUserId + ',user2Id.eq.' + session.userId + ')').limit(1)
    if (existing && existing.length > 0) return NextResponse.json({ error: 'Already swiped' }, { status: 409 })

    const { data: reverse } = await supabase.from('Match').select('id').eq('user1Id', targetUserId).eq('user2Id', session.userId).eq('type', 'liked').limit(1)
    const isMutual = reverse && reverse.length > 0 && type === 'liked'

    if (isMutual) {
      await supabase.from('Match').update({ type: 'mutual' }).eq('id', reverse[0].id)
      const { data: me } = await supabase.from('User').select('name').eq('id', session.userId).single()
      await supabase.from('Notification').insert([{ userId: session.userId, type: 'match', title: "It's a match!", body: 'You and ' + target.name + ' liked each other!', fromUserId: targetUserId, read: false }, { userId: targetUserId, type: 'match', title: "It's a match!", body: 'You and ' + (me?.name || 'Someone') + ' liked each other!', fromUserId: session.userId, read: false }])
    } else {
      await supabase.from('Match').insert({ user1Id: session.userId, user2Id: targetUserId, type })
      if (type === 'liked') await supabase.from('Notification').insert({ userId: targetUserId, type: 'like', title: 'Someone likes you!', body: 'Check discover to see who it is.', fromUserId: session.userId, read: false })
    }

    return NextResponse.json({ success: true, isMutual, type })
  } catch (error) { console.error('Swipe error:', error); return NextResponse.json({ error: 'Something went wrong' }, { status: 500 }) }
}
