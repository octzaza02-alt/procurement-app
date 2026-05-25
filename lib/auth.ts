import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

export type SessionUser = { userId: string; name: string; role: 'admin' | 'user' }

const COOKIE = 'ps'
const secret = () =>
  new TextEncoder().encode(process.env.JWT_SECRET ?? 'dev-secret-change-me')

export const hashPin   = (pin: string) => bcrypt.hash(pin, 10)
export const verifyPin = (pin: string, hash: string) => bcrypt.compare(pin, hash)

export async function createSession(user: SessionUser) {
  const token = await new SignJWT(user as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('8h')
    .sign(secret())
  cookies().set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  })
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const token = cookies().get(COOKIE)?.value
    if (!token) return null
    const { payload } = await jwtVerify(token, secret())
    return payload as unknown as SessionUser
  } catch {
    return null
  }
}

export function clearSession() {
  cookies().delete(COOKIE)
}
