import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/admin-auth'
import { rechargeRequests } from '@/lib/recharge-store'
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
  const action = body.action
  const requestEntry = rechargeRequests.find((r) => r.id === params.id)

  if (!requestEntry) {
    return NextResponse.json({ error: 'Recharge request not found' }, { status: 404 })
  }

  if (action === 'approve') {
    if (requestEntry.status !== 'pending') {
      return NextResponse.json({ error: 'Request already processed' }, { status: 400 })
    }
    requestEntry.status = 'approved'
    requestEntry.approvedBy = auth.username
    requestEntry.approvedAt = new Date().toISOString()

    const user = registrations.find((u) => u.id === requestEntry.userId)
    if (user) {
      user.walletBalance = (user.walletBalance || 0) + requestEntry.amount
      user.topupHistory = user.topupHistory || []
      user.topupHistory.unshift({
        id: Date.now().toString(),
        amount: requestEntry.amount,
        currency: requestEntry.currency,
        date: new Date().toLocaleDateString(),
        source: 'Admin Approved Recharge',
      })
    }

    return NextResponse.json({ message: 'Recharge request approved', request: requestEntry })
  }

  if (action === 'reject') {
    if (requestEntry.status !== 'pending') {
      return NextResponse.json({ error: 'Request already processed' }, { status: 400 })
    }
    requestEntry.status = 'rejected'
    requestEntry.rejectedBy = auth.username
    requestEntry.rejectedAt = new Date().toISOString()
    requestEntry.rejectionReason = body.reason || 'Rejected by admin'

    return NextResponse.json({ message: 'Recharge request rejected', request: requestEntry })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
