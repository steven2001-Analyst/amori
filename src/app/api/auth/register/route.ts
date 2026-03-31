import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, createToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Email, password, and name are required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)
    const token = await createToken({ userId: '', email })

    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        name,
        age: 0,
        gender: '',
        bio: '',
        interests: [],
        location: '',
        occupation: '',
        lookingFor: '',
        maxDistance: 50,
        ageRangeMin: 18,
        ageRangeMax: 65,
      },
    })

    const userToken = await createToken({ userId: user.id, email: user.email })

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        age: user.age,
        gender: user.gender,
        bio: user.bio,
        interests: user.interests,
        location: user.location,
        occupation: user.occupation,
        isPremium: user.isPremium,
        onboarded: !!(user.age && user.gender && Array.isArray(user.interests) && user.interests.length > 0),
      },
      token: userToken,
    })

    response.cookies.set('amori-token', userToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
