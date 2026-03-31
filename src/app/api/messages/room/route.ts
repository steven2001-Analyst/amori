import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const matchId = request.nextUrl.searchParams.get('matchId')
    if (!matchId) return NextResponse.json({ error: 'matchId required' }, { status: 400 })

    const token = request.cookies.get('amori-token')?.value
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    // Fetch messages
    const { data: messages, error } = await supabase
      .from('Message')
      .select('*')
      .eq('matchId', matchId)
      .order('createdAt', { ascending: true })

    if (error) {
      console.error('Get messages error:', error)
      return NextResponse.json({ error: 'Failed to get messages' }, { status: 500 })
    }

    // Fetch the Match to determine the other user
    const { data: match, error: matchError } = await supabase
      .from('Match')
      .select('user1Id, user2Id')
      .eq('id', matchId)
      .single()

    const otherUserId = match
      ? (match.user1Id === payload.userId ? match.user2Id : match.user1Id)
      : null

    // Fetch other user's profile
    let otherUser = null
    if (otherUserId) {
      const { data: userData } = await supabase
        .from('User')
        .select('id, name, avatar, age, isOnline')
        .eq('id', otherUserId)
        .single()
      if (userData) {
        otherUser = {
          id: userData.id,
          name: userData.name,
          avatar: userData.avatar,
          age: userData.age,
          isOnline: userData.isOnline,
        }
      }
    }

    return NextResponse.json({ messages: messages || [], otherUser })
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json({ error: 'Failed to get messages' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const matchId = request.nextUrl.searchParams.get('matchId')
    if (!matchId) return NextResponse.json({ error: 'matchId required' }, { status: 400 })

    const token = request.cookies.get('amori-token')?.value
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const { content, type } = await request.json()
    if (!content) return NextResponse.json({ error: 'Content required' }, { status: 400 })

    const { data: message, error } = await supabase
      .from('Message')
      .insert({
        matchId,
        senderId: payload.userId,
        content,
        type: type || 'text',
      })
      .select()
      .single()

    if (error || !message) {
      console.error('Send message error:', error)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
