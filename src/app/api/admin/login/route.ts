import { NextRequest, NextResponse } from 'next/server'
import { createAuthCookie, validateAdminCredentials, AUTH_MAX_AGE } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
    }

    const admin = validateAdminCredentials(username, password)

    if (!admin) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
    }

    const authPayload = {
      username: admin.username,
      role: admin.role,
      iat: Date.now(),
      exp: Date.now() + AUTH_MAX_AGE * 1000,
    }

    const response = NextResponse.json({ message: 'Login successful' })
    response.headers.set('Set-Cookie', createAuthCookie(authPayload))
    return response
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
