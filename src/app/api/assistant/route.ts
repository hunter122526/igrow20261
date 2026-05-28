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
    const reply = getGenkitText(response) || knownAnswer || "I'm sorry — I don't have an answer for that yet. An admin can add it to my knowledge base."

    return NextResponse.json({ assistant: 'Growi', reply })
  } catch (err: any) {
    const errorMessage = err?.message || 'Server error'
    const fallback = knownAnswer || "I'm sorry — I don't have an answer for that yet. An admin can add it to my knowledge base."
    return NextResponse.json({ assistant: 'Growi', reply: fallback, error: errorMessage }, { status: 500 })
  }
}

function getGenkitText(response: any) {
  if (!response) return null
  if (typeof response.text === 'string') return response.text

  const messageContent = response?.message?.content
  if (Array.isArray(messageContent) && messageContent.length) {
    const first = messageContent[0]
    if (typeof first?.text === 'string') return first.text
    const partText = first?.parts?.[0]?.text
    if (typeof partText === 'string') return partText
  }

  if (typeof messageContent?.text === 'string') return messageContent.text
  if (typeof messageContent?.parts?.[0]?.text === 'string') return messageContent.parts[0].text

  const candidateText = response?.custom?.candidates?.[0]?.content?.parts?.[0]?.text
  if (typeof candidateText === 'string') return candidateText

  return null
}

export async function GET() {
  return NextResponse.json({ assistant: 'Growi', info: 'Send POST { message } to receive AI-powered assistant replies.' })
}
