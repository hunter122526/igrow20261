import { NextRequest, NextResponse } from 'next/server'
import { findBestAnswer } from '@/lib/knowledge-base'
import { ai } from '@/ai/genkit'

export async function POST(req: NextRequest) {
  let knownAnswer: string | null = null

  try {
    const body = await req.json()
    const message = (body?.message || '').toString()
    if (!message) return NextResponse.json({ error: 'No message' }, { status: 400 })

    knownAnswer = findBestAnswer(message)
    const supportPrompt = `You are Growi support for iGrow Society. Answer user questions clearly and politely. If a reference answer is provided, use it exactly. If you cannot answer, say: \"I'm sorry — I don't have that information right now. An admin can add it to our knowledge base.\"`
    const prompt = knownAnswer
      ? `${supportPrompt}\n\nReference answer:\n${knownAnswer}\n\nQuestion:\n${message}`
      : `${supportPrompt}\n\nQuestion:\n${message}`

    const response = await ai.generate({ prompt, system: 'You are a friendly customer support assistant.' })
    const reply = response?.text?.trim() || knownAnswer || "I'm sorry — I don't have an answer for that yet. An admin can add it to my knowledge base."

    return NextResponse.json({ assistant: 'Growi', reply })
  } catch (err: any) {
    const errorMessage = err?.message || 'Server error'
    const fallback = knownAnswer || "I'm sorry — I don't have an answer for that yet. An admin can add it to my knowledge base."
    return NextResponse.json({ assistant: 'Growi', reply: fallback, error: errorMessage }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ assistant: 'Growi', info: 'Send POST { message } to receive AI-powered assistant replies.' })
}
