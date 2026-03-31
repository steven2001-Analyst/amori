import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'amori-jwt-secret-2026')

export async function hashPassword(password: string) { return bcrypt.hash(password, 12) }
export async function verifyPassword(password: string, hash: string) { return bcrypt.compare(password, hash) }

export async function createToken(payload: { userId: string; email: string }) {
  return new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('7d').sign(secret)
}

export async function verifyToken(token: string) {
  try { const { payload } = await jwtVerify(token, secret); return payload as { userId: string; email: string } }
  catch { return null }
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('amori-token')?.value
  if (!token) return null
  return verifyToken(token)
}
