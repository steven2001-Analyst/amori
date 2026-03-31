import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { data: me } = await supabase.from('User').select('ageRangeMin, ageRangeMax, interests').eq('id', session.userId).single()
    if (!me) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { data: existing } = await supabase.from('Match').select('user1Id, user2Id').or('user1Id.eq.' + session.userId + ',user2Id.eq.' + session.userId)
    const swiped = new Set((existing || []).map((m: { user1Id: string; user2Id: string }) => m.user1Id === session.userId ? m.user2Id : m.user1Id))

    const { data: users } = await supabase.from('User').select('id, name, avatar, age, gender, bio, interests, location, occupation').neq('id', session.userId).limit(30)
    const userIds = (users || []).map((u: { id: string }) => u.id)

    let photosMap: Record<string, Array<{ url: string; isProfile: boolean }>> = {}
    if (userIds.length > 0) {
      const { data: photos } = await supabase.from('Photo').select('userId, url, isProfile').in('userId', userIds)
      if (photos) { for (const p of photos) { if (!photosMap[p.userId]) photosMap[p.userId] = []; photosMap[p.userId].push({ url: p.url, isProfile: p.isProfile }) } }
    }

    const filtered = (users || []).filter((u: { id: string }) => !swiped.has(u.id)).map((u: any) => ({ ...u, interests: Array.isArray(u.interests) ? u.interests : [], photos: photosMap[u.id] || [] }))
    return NextResponse.json(filtered)
  } catch (error) { console.error('Discover error:', error); return NextResponse.json({ error: 'Something went wrong' }, { status: 500 }) }
}
