import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

const PUBLIC = ['/login', '/api/auth', '/api/users']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (PUBLIC.some(p => pathname.startsWith(p)) || pathname.startsWith('/_next')) {
    return NextResponse.next()
  }
  const session = await getSession()
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  if (pathname.startsWith('/admin') && session.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
  return NextResponse.next()
}

export const config = { matcher: ['/((?!_next/static|favicon.ico).*)'] }
