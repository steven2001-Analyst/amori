import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    const { reportedId, reason } = await request.json()
    if (!reportedId || !reason) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    if (reportedId === session.userId) return NextResponse.json({ error: 'Cannot report yourself' }, { status: 400 })

    const crypto = await import('crypto')
    const { error } = await supabase.from('Report').insert({ id: crypto.randomUUID(), reporterId: session.userId, reportedId, reason, status: 'pending' })
    if (error) return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 })

    await supabase.from('Notification').insert({ id: crypto.randomUUID(), userId: reportedId, type: 'report', title: 'You received a report', body: 'Your profile has been reviewed. Please follow our community guidelines.', read: false })

    return NextResponse.json({ success: true })
  } catch (error) { console.error('Report error:', error); return NextResponse.json({ error: 'Something went wrong' }, { status: 500 }) }
}
