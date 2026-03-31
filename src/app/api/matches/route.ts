import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { data: matches } = await supabase.from('Match').select('id, user1Id, user2Id, createdAt').or('and(user1Id.eq.' + session.userId + ',type.eq.mutual),and(user2Id.eq.' + session.userId + ',type.eq.mutual)').order('createdAt', { ascending: false })

    if (!matches || matches.length === 0) return NextResponse.json([])

    const otherIds = matches.map((m: { user1Id: string; user2Id: string }) => m.user1Id === session.userId ? m.user2Id : m.user1Id)
    const { data: users } = await supabase.from('User').select('id, name, avatar, age, isOnline').in('id', otherIds)
    const userMap: Record<string, any> = {}
    if (users) for (const u of users) userMap[u.id] = u

    const result = await Promise.all(matches.map(async (m: { id: string; user1Id: string; user2Id: string; createdAt: string }) => {
      const otherId = m.user1Id === session.userId ? m.user2Id : m.user1Id
      const other = userMap[otherId] || { id: otherId, name: 'Unknown', avatar: null, age: null, isOnline: false }
      const { data: lastMsg } = await supabase.from('Message').select('content, createdAt').eq('matchId', m.id).order('createdAt', { ascending: false }).limit(1).single()
      return { matchId: m.id, user: other, lastMessage: lastMsg?.content || null, lastMessageTime: lastMsg?.createdAt || m.createdAt }
    }))

    return NextResponse.json(result)
  } catch (error) { console.error('Matches error:', error); return NextResponse.json({ error: 'Something went wrong' }, { status: 500 }) }
}
