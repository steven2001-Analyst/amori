import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    const session = await getSession()
    if (session) await supabase.from('User').update({ isOnline: false, lastSeen: new Date().toISOString() }).eq('id', session.userId)
    const response = NextResponse.json({ success: true })
    response.cookies.set('amori-token', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 0, path: '/' })
    return response
  } catch (error) { console.error('Logout error:', error); return NextResponse.json({ error: 'Something went wrong' }, { status: 500 }) }
}
