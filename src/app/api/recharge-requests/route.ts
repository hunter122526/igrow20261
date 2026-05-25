import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/admin-auth'
import { rechargeRequests } from '@/lib/recharge-store'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const auth = requireAdminAuth(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({ requests: rechargeRequests })
}
