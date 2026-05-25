import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const auth = getAdminAuth(request)
  if (!auth) {
    return NextResponse.json({ loggedIn: false }, { status: 401 })
  }

  return NextResponse.json({ loggedIn: true, user: { username: auth.username, role: auth.role } })
}
