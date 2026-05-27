import { NextRequest, NextResponse } from 'next/server'
import { registrations } from '@/lib/registrations-store'
import { getUserIdFromToken } from '@/lib/user-auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const userId = getUserIdFromToken(request)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { amount, currency } = body
  const value = parseFloat(amount)

  if (!value || value <= 0) {
    return NextResponse.json({ error: 'Invalid topup amount' }, { status: 400 })
  }

  const user = registrations.find((r) => r.id === userId)
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const selectedCurrency = (currency || user.walletCurrency || 'INR').toUpperCase()
  user.walletBalance = (user.walletBalance || 0) + value
  user.walletCurrency = selectedCurrency
  user.topupHistory = user.topupHistory || []
  const topupEntry = {
    id: Date.now().toString(),
    amount: value,
    currency: selectedCurrency,
    date: new Date().toLocaleDateString(),
    source: 'User Topup',
  }
  user.topupHistory.unshift(topupEntry)

  return NextResponse.json({
    walletBalance: user.walletBalance,
    walletCurrency: user.walletCurrency,
    topupHistory: user.topupHistory,
  })
}
