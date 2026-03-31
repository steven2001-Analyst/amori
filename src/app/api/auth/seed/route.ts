import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

const SEED_SECRET = process.env.SEED_SECRET || 'amori-seed-2026'

const sampleUsers = [
  {
    email: 'stevensaleh100@outlook.com',
    name: 'Steven',
    age: 28,
    gender: 'Male',
    bio: 'Passionate about building amazing things',
    interests: ['Technology', 'Music', 'Travel', 'Photography'],
    location: 'Dar es Salaam',
    occupation: 'Software Developer',
    lookingFor: 'Long-term relationship',
    isPremium: true,
  },
  {
    email: 'sarah@example.com',
    name: 'Sarah',
    age: 25,
    gender: 'Female',
    bio: 'Love traveling and trying new cuisines! Coffee addict and sunset chaser.',
    interests: ['Travel', 'Cooking', 'Photography', 'Music', 'Yoga'],
    location: 'Dar es Salaam',
    occupation: 'Marketing Manager',
    lookingFor: 'Long-term relationship',
  },
  {
    email: 'james@example.com',
    name: 'James',
    age: 30,
    gender: 'Male',
    bio: 'Tech entrepreneur by day, musician by night. Love hiking and adventure.',
    interests: ['Technology', 'Music', 'Hiking', 'Photography', 'Startups'],
    location: 'Nairobi',
    occupation: 'Software Engineer',
    lookingFor: 'Serious relationship',
  },
  {
    email: 'amina@example.com',
    name: 'Amina',
    age: 23,
    gender: 'Female',
    bio: 'Medical student who loves painting and watching documentaries.',
    interests: ['Art', 'Medicine', 'Documentaries', 'Reading', 'Fitness'],
    location: 'Dar es Salaam',
    occupation: 'Medical Student',
    lookingFor: 'Dating',
  },
  {
    email: 'david@example.com',
    name: 'David',
    age: 27,
    gender: 'Male',
    bio: 'Architect with a passion for sustainable design. Dog lover.',
    interests: ['Architecture', 'Design', 'Sustainability', 'Dogs', 'Travel'],
    location: 'Kampala',
    occupation: 'Architect',
    lookingFor: 'Long-term relationship',
  },
  {
    email: 'fatima@example.com',
    name: 'Fatima',
    age: 26,
    gender: 'Female',
    bio: 'Fashion designer who believes in making the world more colorful.',
    interests: ['Fashion', 'Design', 'Art', 'Shopping', 'Dancing'],
    location: 'Mombasa',
    occupation: 'Fashion Designer',
    lookingFor: 'Dating',
  },
  {
    email: 'eric@example.com',
    name: 'Eric',
    age: 29,
    gender: 'Male',
    bio: 'Data scientist and amateur chef. Always looking for the next adventure.',
    interests: ['Cooking', 'Technology', 'Hiking', 'Data', 'Coffee'],
    location: 'Dar es Salaam',
    occupation: 'Data Scientist',
    lookingFor: 'Serious relationship',
  },
  {
    email: 'grace@example.com',
    name: 'Grace',
    age: 24,
    gender: 'Female',
    bio: 'Teacher who loves kids, books, and weekend getaways.',
    interests: ['Reading', 'Teaching', 'Travel', 'Yoga', 'Music'],
    location: 'Nairobi',
    occupation: 'Teacher',
    lookingFor: 'Long-term relationship',
  },
  {
    email: 'mark@example.com',
    name: 'Mark',
    age: 32,
    gender: 'Male',
    bio: 'Filmmaker and storyteller. Passionate about African cinema.',
    interests: ['Film', 'Photography', 'Writing', 'Music', 'Travel'],
    location: 'Accra',
    occupation: 'Filmmaker',
    lookingFor: 'Dating',
  },
]

export async function POST(request: Request) {
  try {
    const { secret } = await request.json()
    if (secret !== SEED_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
    }

    const passwordHash = await hashPassword('Amori2026!')
    let created = 0

    for (const user of sampleUsers) {
      const existing = await db.user.findUnique({ where: { email: user.email } })
      if (!existing) {
        await db.user.create({
          data: {
            email: user.email,
            name: user.name,
            passwordHash,
            age: user.age,
            gender: user.gender,
            bio: user.bio,
            interests: user.interests,
            location: user.location,
            occupation: user.occupation,
            lookingFor: user.lookingFor,
            isPremium: user.isPremium || false,
          },
        })
        created++
      }
    }

    return NextResponse.json({ success: true, created, total: sampleUsers.length })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 })
  }
}
