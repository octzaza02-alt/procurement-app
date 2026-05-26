import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const COOKIE = 'ps'
const PUBLIC = ['/login', '/api/auth', '/api/users']

const secret = () =>
  new TextEncoder().encode(process.env.JWT_SECRET ?? 'dev-secret-change-me')

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (PUBLIC.some(p => pathname.startsWith(p)) || pathname.startsWith('/_next')) {
    return NextResponse.next()
  }

  // Middleware ใช้ req.cookies แทน next/headers ใน Next.js 15
  const token = req.cookies.get(COOKIE)?.value
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  try {
    const { payload } = await jwtVerify(token, secret())
    const role = (payload as { role?: string }).role

    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = { matcher: ['/((?!_next/static|favicon.ico).*)'] }
