import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth } from '@/lib/admin-auth'
import { qaEntries, addQA } from '@/lib/knowledge-base'

export async function GET(req: NextRequest) {
  const admin = getAdminAuth(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ entries: qaEntries })
}

export async function POST(req: NextRequest) {
  const admin = getAdminAuth(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const question = (body?.question || '').toString()
    const answer = (body?.answer || '').toString()
    if (!question || !answer) return NextResponse.json({ error: 'question and answer required' }, { status: 400 })
    const entry = addQA(question, answer)
    return NextResponse.json({ entry })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
