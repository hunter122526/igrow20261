import { NextRequest } from 'next/server'

export function getUserIdFromToken(request: NextRequest) {
  const authHeader = request.headers.get('Authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : request.headers.get('x-user-token') || ''
  if (!token) {
    return null
  }

  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8')
    const [userId] = decoded.split(':')
    return userId || null
  } catch {
    return null
  }
}

export function requireUserId(request: NextRequest) {
  return getUserIdFromToken(request)
}
