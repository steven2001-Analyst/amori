import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
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

    const { data: targetUser, error: targetError } = await supabase
      .from('User')
      .select('id, name')
      .eq('id', targetUserId)
      .single()

    if (targetError || !targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Check if already swiped (any match record between these two users)
    const { data: existing } = await supabase
      .from('Match')
      .select('id')
      .or(`user1Id.eq.${payload.userId},user2Id.eq.${payload.userId}`)
      .or(`user1Id.eq.${targetUserId},user2Id.eq.${targetUserId}`)
      .limit(1)

    // More precise: check for any match between these two specific users
    const { data: existingMatch } = await supabase
      .from('Match')
      .select('id')
      .or(`and(user1Id.eq.${payload.userId},user2Id.eq.${targetUserId}),and(user1Id.eq.${targetUserId},user2Id.eq.${payload.userId})`)
      .limit(1)

    if (existingMatch && existingMatch.length > 0) {
      return NextResponse.json({ error: 'Already swiped on this user' }, { status: 409 })
    }

    // Check if they liked us
    const { data: reverseSwipe } = await supabase
      .from('Match')
      .select('id')
      .eq('user1Id', targetUserId)
      .eq('user2Id', payload.userId)
      .eq('type', 'liked')
      .limit(1)

    const isMutual = reverseSwipe && reverseSwipe.length > 0 && type === 'liked'

    if (isMutual) {
      // Update the reverse swipe to mutual
      await supabase
        .from('Match')
        .update({ type: 'mutual' })
        .eq('id', reverseSwipe[0].id)

      // Get current user's name
      const { data: currentUser } = await supabase
        .from('User')
        .select('name')
        .eq('id', payload.userId)
        .single()

      // Create notifications for both users
      await supabase.from('Notification').insert({
        userId: payload.userId,
        type: 'match',
        title: "It's a match!",
        body: `You and ${targetUser.name} liked each other!`,
        fromUserId: targetUserId,
        read: false,
      })

      await supabase.from('Notification').insert({
        userId: targetUserId,
        type: 'match',
        title: "It's a match!",
        body: `You and ${currentUser?.name || 'Someone'} liked each other!`,
        fromUserId: payload.userId,
        read: false,
      })
    } else {
      // Create a new match record (liked or passed)
      const { error: createError } = await supabase.from('Match').insert({
        user1Id: payload.userId,
        user2Id: targetUserId,
        type,
      })

      if (createError) {
        console.error('Create match error:', createError)
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
      }

      if (type === 'liked') {
        await supabase.from('Notification').insert({
          userId: targetUserId,
          type: 'like',
          title: 'Someone likes you!',
          body: 'Check discover to see who it is.',
          fromUserId: payload.userId,
          read: false,
        })
      }
    }

    // Update swipe count
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: swipeUser } = await supabase
      .from('User')
      .select('swipesResetDate, swipesToday')
      .eq('id', payload.userId)
      .single()

    if (swipeUser) {
      const resetDate = new Date(swipeUser.swipesResetDate)
      if (resetDate < today) {
        await supabase
          .from('User')
          .update({ swipesToday: 1, swipesResetDate: new Date().toISOString() })
          .eq('id', payload.userId)
      } else {
        await supabase
          .from('User')
          .update({ swipesToday: (swipeUser.swipesToday || 0) + 1 })
          .eq('id', payload.userId)
      }
    }

    return NextResponse.json({ success: true, isMutual, type })
  } catch (error) {
    console.error('Swipe error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
