import { NextRequest, NextResponse } from 'next/server'
import { registrations } from '@/lib/registrations-store'
import { rechargeRequests } from '@/lib/recharge-store'
import { getUserIdFromToken } from '@/lib/user-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const userId = getUserIdFromToken(request)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = registrations.find((r) => r.id === userId)
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const requests = rechargeRequests.filter((req) => req.userId === userId)
  return NextResponse.json({ requests })
}

export async function POST(request: NextRequest) {
  const userId = getUserIdFromToken(request)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const amount = parseFloat(body.amount)
  const currency = body.currency || 'USDT'
  const method = body.method || 'Crypto Wallet'
  const note = body.note || ''

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Invalid request amount' }, { status: 400 })
  }

  const user = registrations.find((r) => r.id === userId)
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const requestEntry = {
    id: Date.now().toString(),
    userId,
    userName: user.name,
    userEmail: user.email,
    amount,
    currency,
    method,
    note,
    status: 'pending',
    requestedAt: new Date().toLocaleDateString(),
  }

  rechargeRequests.unshift(requestEntry)

  return NextResponse.json({ message: 'Recharge request submitted', request: requestEntry })
}
