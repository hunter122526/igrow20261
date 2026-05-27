import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/admin-auth'
import { registrations } from '@/lib/registrations-store'
import { transferFromAdminWallet } from '@/lib/admin-wallet-store'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const auth = requireAdminAuth(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const amount = parseFloat(body.amount)
  const currency = (body.currency || 'INR').toUpperCase()
  const userId = body.userId
  const note = body.note || 'Admin wallet transfer'

  if (isNaN(amount) || amount <= 0) {
    return NextResponse.json({ error: 'Invalid transfer amount' }, { status: 400 })
  }

  if (!userId) {
    return NextResponse.json({ error: 'User is required' }, { status: 400 })
  }

  if (!['INR', 'USDT', 'EUR'].includes(currency)) {
    return NextResponse.json({ error: 'Unsupported currency' }, { status: 400 })
  }

  const user = registrations.find((entry) => entry.id === userId)
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const transferResult = transferFromAdminWallet(amount, currency as any, userId, note)
  if (!transferResult.success) {
    return NextResponse.json({
      error: `Insufficient balance in admin wallet for ${currency}`,
      available: transferResult.available,
    }, { status: 400 })
  }

  user.walletBalance = (user.walletBalance || 0) + amount
  user.walletCurrency = currency
  user.topupHistory = user.topupHistory || []
  user.topupHistory.unshift({
    id: Date.now().toString(),
    amount,
    currency,
    date: new Date().toLocaleDateString(),
    source: `Admin wallet transfer by ${auth.username}`,
    note,
  })

  return NextResponse.json({
    message: 'Wallet transfer completed',
    balances: transferResult.balances,
    walletBalance: user.walletBalance,
    walletCurrency: user.walletCurrency,
    topupHistory: user.topupHistory,
  })
}
