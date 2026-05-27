import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/admin-auth'
import { depositToAdminWallet } from '@/lib/admin-wallet-store'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const auth = requireAdminAuth(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const amount = parseFloat(body.amount)
  const currency = (body.currency || 'INR').toUpperCase()
  const note = body.note || 'Admin wallet deposit'

  if (isNaN(amount) || amount <= 0) {
    return NextResponse.json({ error: 'Invalid deposit amount' }, { status: 400 })
  }

  if (!['INR', 'USDT', 'EUR'].includes(currency)) {
    return NextResponse.json({ error: 'Unsupported currency' }, { status: 400 })
  }

  const result = depositToAdminWallet(amount, currency as any, note)
  return NextResponse.json(result)
}
