export interface QAEntry {
  id: string
  question: string
  answer: string
  createdAt: number
}

export const qaEntries: QAEntry[] = []

export function addQA(question: string, answer: string) {
  const entry: QAEntry = { id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`, question, answer, createdAt: Date.now() }
  qaEntries.unshift(entry)
  return entry
}

export function removeQA(id: string) {
  const idx = qaEntries.findIndex(e => e.id === id)
  if (idx !== -1) qaEntries.splice(idx, 1)
}

const STOP_WORDS = new Set([
  'a','an','and','are','as','at','be','by','for','from','how','in','is','it','of','on','or','that','the','this','to','was','what','when','where','which','who','will','with','you','your','i','my','me','we','us'
])

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[’‘'"\“\”\?\!\.,;:\(\)\[\]\{\}\-\/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenize(text: string) {
  return normalize(text)
    .split(' ')
    .filter(Boolean)
    .filter(token => !STOP_WORDS.has(token))
}

function similarity(a: string[], b: string[]) {
  const setA = new Set(a)
  const setB = new Set(b)
  const intersection = Array.from(setA).filter(word => setB.has(word)).length
  const union = new Set(Array.from(setA).concat(Array.from(setB))).size
  return union === 0 ? 0 : intersection / union
}

export function findBestAnswer(message: string) {
  const text = normalize(message || '')
  if (!text) return null

  const messageTokens = tokenize(text)
  let bestScore = 0
  let bestEntry: QAEntry | null = null

  for (const entry of qaEntries) {
    const entryQuestion = normalize(entry.question)
    if (text === entryQuestion || entryQuestion.includes(text) || text.includes(entryQuestion)) {
      return entry.answer
    }

    const entryTokens = tokenize(entry.question)
    const score = similarity(messageTokens, entryTokens)
    if (score > bestScore) {
      bestScore = score
      bestEntry = entry
    }
  }

  // accept only strong similarity matches
  if (bestEntry && bestScore >= 0.35) {
    return bestEntry.answer
  }

  // relaxed fallback: match by phrase overlap
  if (messageTokens.length > 0) {
    for (const entry of qaEntries) {
      const entryTokens = tokenize(entry.question)
      const shared = messageTokens.filter(token => entryTokens.includes(token)).length
      if (shared >= Math.min(3, messageTokens.length, entryTokens.length)) {
        return entry.answer
      }
    }
  }

  return null
}
