import { NextResponse } from 'next/server'
import { clearAuthCookie } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out' })
  response.headers.set('Set-Cookie', clearAuthCookie())
  return response
}
