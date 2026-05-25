import { NextRequest, NextResponse } from 'next/server'
import { registrations } from '@/lib/registrations-store'
import { getUserIdFromToken } from '@/lib/user-auth'
import { rechargeRequests } from '@/lib/recharge-store'

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

  const requests = rechargeRequests.filter((request) => request.userId === userId)

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      program: user.program,
      planAmount: user.planAmount,
      approvedAt: user.approvedAt,
      walletBalance: user.walletBalance ?? 0,
      commissionBalance: user.commissionBalance ?? 0,
      topupHistory: user.topupHistory ?? [],
      profileImage: user.profileImage || '',
      idCardIssued: user.idCardIssued || false,
      idCardIssuedAt: user.idCardIssuedAt || '',
    },
    requests,
  })
}

export async function PATCH(request: NextRequest) {
  const userId = getUserIdFromToken(request)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = registrations.find((r) => r.id === userId)
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const body = await request.json()
  const { profileImage } = body

  if (!profileImage || typeof profileImage !== 'string') {
    return NextResponse.json({ error: 'Profile image is required.' }, { status: 400 })
  }

  user.profileImage = profileImage

  const requests = rechargeRequests.filter((request) => request.userId === userId)

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      program: user.program,
      planAmount: user.planAmount,
      approvedAt: user.approvedAt,
      walletBalance: user.walletBalance ?? 0,
      commissionBalance: user.commissionBalance ?? 0,
      topupHistory: user.topupHistory ?? [],
      profileImage: user.profileImage || '',
      idCardIssued: user.idCardIssued || false,
      idCardIssuedAt: user.idCardIssuedAt || '',
    },
    requests,
  })
}
