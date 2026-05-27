import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/admin-auth'
import { registrations } from '@/lib/registrations-store'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = requireAdminAuth(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const params = await context.params
  const body = await request.json()
  const amount = parseFloat(body.amount)
  const currency = body.currency || 'USDT'
  const note = body.note || 'Admin wallet credit'

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }

  const user = registrations.find((user) => user.id === params.id)
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  user.walletBalance = (user.walletBalance || 0) + amount
  user.walletCurrency = currency.toUpperCase()
  user.topupHistory = user.topupHistory || []
  const creditRecord = {
    id: Date.now().toString(),
    amount,
    currency,
    date: new Date().toLocaleDateString(),
    source: `Admin credit by ${auth.username}`,
    note,
  }
  user.topupHistory.unshift(creditRecord)

  return NextResponse.json({
    message: 'User wallet credited successfully',
    walletBalance: user.walletBalance,
    walletCurrency: user.walletCurrency,
    topupHistory: user.topupHistory,
  })
}
