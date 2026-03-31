import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const token = request.cookies.get('amori-token')?.value
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const { data: notification, error: fetchError } = await supabase
      .from('Notification')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !notification) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (notification.userId !== payload.userId) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

    await supabase
      .from('Notification')
      .update({ read: true })
      .eq('id', id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Notification update error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
