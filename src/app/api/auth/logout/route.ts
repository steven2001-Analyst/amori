import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('amori-token')?.value

    if (token) {
      const payload = await verifyToken(token)
      if (payload) {
        await supabase
          .from('User')
          .update({ isOnline: false, lastSeen: new Date().toISOString() })
          .eq('id', payload.userId)
      }
    }

    const response = NextResponse.json({ success: true })
    response.cookies.set('amori-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })
    return response
  } catch (error) {
    console.error('Logout error:', error)
    // Still clear the cookie even if DB update fails
    const response = NextResponse.json({ success: true })
    response.cookies.set('amori-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })
    return response
  }
}
