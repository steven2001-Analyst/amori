import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('amori-token')?.value
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    // Get all mutual matches involving this user
    const { data: matches, error: matchError } = await supabase
      .from('Match')
      .select('*')
      .eq('type', 'mutual')
      .or(`user1Id.eq.${payload.userId},user2Id.eq.${payload.userId}`)
      .order('createdAt', { ascending: false })

    if (matchError) {
      console.error('Matches error:', matchError)
      return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
    }

    if (!matches || matches.length === 0) {
      return NextResponse.json([])
    }

    // Collect all unique user IDs from matches
    const userIds = new Set<string>()
    for (const match of matches) {
      userIds.add(match.user1Id)
      userIds.add(match.user2Id)
    }

    // Fetch all users involved in matches
    const { data: users } = await supabase
      .from('User')
      .select('id, name, avatar, age, isOnline')
      .in('id', Array.from(userIds))

    const usersMap: Record<string, { id: string; name: string; avatar: string | null; age: number; isOnline: boolean }> = {}
    if (users) {
      for (const u of users) {
        usersMap[u.id] = u
      }
    }

    // Fetch last message for each match
    const matchIds = matches.map((m) => m.id)
    const { data: lastMessages } = await supabase
      .from('Message')
      .select('id, content, senderId, createdAt, matchId')
      .in('matchId', matchIds)
      .order('createdAt', { ascending: false })

    // Build a map of last message per matchId
    const lastMessageMap: Record<string, { id: string; content: string; senderId: string; createdAt: string }> = {}
    if (lastMessages) {
      for (const msg of lastMessages) {
        if (!lastMessageMap[msg.matchId]) {
          lastMessageMap[msg.matchId] = {
            id: msg.id,
            content: msg.content,
            senderId: msg.senderId,
            createdAt: msg.createdAt,
          }
        }
      }
    }

    const formatted = matches.map((match) => {
      const otherUser = match.user1Id === payload.userId
        ? usersMap[match.user2Id]
        : usersMap[match.user1Id]
      const lastMessage = lastMessageMap[match.id] || null
      return {
        id: match.id,
        user: otherUser || null,
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
