import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    const matchId = request.nextUrl.searchParams.get('matchId')
    if (!matchId) return NextResponse.json({ error: 'matchId required' }, { status: 400 })

    const { data: messages } = await supabase.from('Message').select('*').eq('matchId', matchId).order('createdAt', { ascending: true })
    const { data: match } = await supabase.from('Match').select('user1Id, user2Id').eq('id', matchId).single()
    const otherId = match ? (match.user1Id === session.userId ? match.user2Id : match.user1Id) : null

    let otherUser = null
    if (otherId) {
      const { data: u } = await supabase.from('User').select('id, name, avatar, age, isOnline').eq('id', otherId).single()
      if (u) otherUser = u
    }

    return NextResponse.json({ messages: messages || [], otherUser })
  } catch (error) { console.error('Get messages error:', error); return NextResponse.json({ error: 'Something went wrong' }, { status: 500 }) }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    const matchId = request.nextUrl.searchParams.get('matchId')
    if (!matchId) return NextResponse.json({ error: 'matchId required' }, { status: 400 })
    const { content } = await request.json()
    if (!content) return NextResponse.json({ error: 'Content required' }, { status: 400 })

    const { data, error } = await supabase.from('Message').insert({ matchId, senderId: session.userId, content, type: 'text' }).select().single()
    if (error || !data) return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
    return NextResponse.json({ message: data })
  } catch (error) { console.error('Send message error:', error); return NextResponse.json({ error: 'Something went wrong' }, { status: 500 }) }
}
