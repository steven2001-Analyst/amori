import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('amori-token')?.value
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    // Get current user's preferences
    const { data: currentUser, error: userError } = await supabase
      .from('User')
      .select('ageRangeMin, ageRangeMax, maxDistance, gender, interests')
      .eq('id', payload.userId)
      .single()

    if (userError || !currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Get existing matches to filter out already-swiped users
    const { data: existingMatches, error: matchError } = await supabase
      .from('Match')
      .select('user1Id, user2Id')
      .or(`user1Id.eq.${payload.userId},user2Id.eq.${payload.userId}`)

    if (matchError) {
      console.error('Fetch matches error:', matchError)
      return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
    }

    const swipedUserIds = new Set(
      (existingMatches || []).map((m) =>
        m.user1Id === payload.userId ? m.user2Id : m.user1Id
      )
    )

    // Fetch potential users with age filter, excluding self
    const { data: users, error: usersError } = await supabase
      .from('User')
      .select('id, name, avatar, age, gender, bio, interests, location, occupation, lookingFor')
      .neq('id', payload.userId)
      .gte('age', currentUser.ageRangeMin)
      .lte('age', currentUser.ageRangeMax)
      .limit(30)

    if (usersError) {
      console.error('Fetch users error:', usersError)
      return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
    }

    // Fetch photos for all users separately
    const userIds = (users || []).map((u) => u.id)
    let photosMap: Record<string, Array<{ id: string; url: string; order: number; isProfile: boolean }>> = {}

    if (userIds.length > 0) {
      const { data: photos } = await supabase
        .from('Photo')
        .select('id, url, order, isProfile, userId')
        .in('userId', userIds)

      if (photos) {
        for (const photo of photos) {
          if (!photosMap[photo.userId]) photosMap[photo.userId] = []
          photosMap[photo.userId].push({
            id: photo.id,
            url: photo.url,
            order: photo.order,
            isProfile: photo.isProfile,
          })
        }
      }
    }

    // Filter out already-swiped users and format
    const filtered = (users || [])
      .filter((u) => !swipedUserIds.has(u.id))
      .map((u) => ({
        ...u,
        interests: Array.isArray(u.interests) ? u.interests : [],
        photos: photosMap[u.id] || [],
      }))

    return NextResponse.json(filtered)
  } catch (error) {
    console.error('Discover error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
