import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { hashPassword, createToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()
    if (!name || !email || !password) return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    if (password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })

    const { data: existing } = await supabase.from('User').select('id').eq('email', email).single()
    if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 409 })

    const passwordHash = await hashPassword(password)
    const crypto = await import('crypto')
    const { data: user, error } = await supabase.from('User').insert({ id: crypto.randomUUID(), name, email, passwordHash, interests: [], isPremium: false, isOnline: true, swipesToday: 0, ageRangeMin: 18, ageRangeMax: 50, maxDistance: 50, swipesResetDate: new Date().toISOString() }).select().single()
    if (error) { console.error('Register error:', error); return NextResponse.json({ error: 'Failed to create account' }, { status: 500 }) }

    const token = await createToken({ userId: user.id, email: user.email })
    const response = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar, age: user.age, gender: user.gender, bio: user.bio, interests: [], isPremium: false, onboarded: false }, token })
    response.cookies.set('amori-token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' })
    return response
  } catch (error) { console.error('Register error:', error); return NextResponse.json({ error: 'Something went wrong' }, { status: 500 }) }
}
