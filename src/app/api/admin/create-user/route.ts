import { NextRequest, NextResponse } from 'next/server'
import { registrations } from '@/lib/registrations-store'
import { requireAdminAuth } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

function generatePassword() {
  return Math.random().toString(36).slice(-8)
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAdminAuth(request)
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, phone, program } = body

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email required' }, { status: 400 })
    }

    if (registrations.some((r) => r.email === email)) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    const tempPassword = generatePassword()

    const registration = {
      id: Date.now().toString(),
      name,
      phone: phone || '',
      email,
      address: '',
      program: program || '',
      planAmount: 0,
      referralName: '',
      referralCode: '',
      password: tempPassword,
      date: new Date().toISOString().split('T')[0],
      status: 'approved',
      approvedAt: new Date().toISOString(),
      rejectionReason: '',
      walletBalance: 0,
      commissionBalance: 0,
      topupHistory: [],
      parentId: '',
      side: '',
      leftChildId: '',
      rightChildId: ''
    }

    registrations.push(registration)

    return NextResponse.json({ message: 'User created', id: registration.id, tempPassword, registration }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
