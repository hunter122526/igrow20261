import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/admin-auth'
import { getAdminWalletBalances } from '@/lib/admin-wallet-store'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const auth = requireAdminAuth(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json(getAdminWalletBalances())
}
