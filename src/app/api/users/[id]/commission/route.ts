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
  const action = body.action // 'add' or 'deduct' or 'set'
  const reason = body.reason || ''

  if (isNaN(amount)) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }

  const user = registrations.find((u) => u.id === params.id)
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  user.commissionBalance = user.commissionBalance || 0

  if (action === 'add') {
    user.commissionBalance += amount
  } else if (action === 'deduct') {
    user.commissionBalance = Math.max(0, user.commissionBalance - amount)
  } else if (action === 'set') {
    user.commissionBalance = Math.max(0, amount)
  } else {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  // record history in topupHistory for transparency
  user.topupHistory = user.topupHistory || []
  user.topupHistory.unshift({
    id: Date.now().toString(),
    amount: amount,
    currency: 'INR',
    date: new Date().toLocaleDateString(),
    source: `Commission ${action} by ${auth.username}`,
    note: reason,
  })

  return NextResponse.json({ message: 'Commission updated', commissionBalance: user.commissionBalance, user })
}
