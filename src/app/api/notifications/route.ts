import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    const unreadOnly = request.nextUrl.searchParams.get('unread') === 'true'

    let query = supabase.from('Notification').select('*').eq('userId', session.userId).order('createdAt', { ascending: false }).limit(50)
    if (unreadOnly) query = query.eq('read', false)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    return NextResponse.json(data || [])
  } catch (error) { console.error('Notifications error:', error); return NextResponse.json({ error: 'Something went wrong' }, { status: 500 }) }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const { error } = await supabase.from('Notification').update({ read: true }).eq('id', id).eq('userId', session.userId)
    if (error) return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (error) { console.error('Notification update error:', error); return NextResponse.json({ error: 'Something went wrong' }, { status: 500 }) }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const { error } = await supabase.from('Notification').delete().eq('id', id).eq('userId', session.userId)
    if (error) return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (error) { console.error('Notification delete error:', error); return NextResponse.json({ error: 'Something went wrong' }, { status: 500 }) }
}
