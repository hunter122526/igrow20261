import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth } from '@/lib/admin-auth'
import { removeQA } from '@/lib/knowledge-base'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = getAdminAuth(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = params.id
  removeQA(id)
  return NextResponse.json({ ok: true })
}
