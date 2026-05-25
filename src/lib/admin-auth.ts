import crypto from 'crypto'
import { NextRequest } from 'next/server'

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'Iadmin2026'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin@igrow2026'
const AUTH_SECRET = process.env.ADMIN_AUTH_SECRET || 'change-this-secret'
const COOKIE_NAME = 'admin_auth'
export const AUTH_MAX_AGE = 60 * 60 * 4 // 4 hours

export type AdminRole = 'admin' | 'editor'

export interface AdminPayload {
  username: string
  role: AdminRole
  iat: number
  exp: number
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url')
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function sign(data: string) {
  return base64UrlEncode(
    crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('base64')
  )
}

function verifySignature(data: string, signature: string) {
  const expected = sign(data)
  const expectedBuffer = Buffer.from(expected, 'utf8')
  const signatureBuffer = Buffer.from(signature, 'utf8')
  if (expectedBuffer.length !== signatureBuffer.length) {
    return false
  }
  return crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
}

export function createAdminToken(payload: AdminPayload) {
  const data = base64UrlEncode(JSON.stringify(payload))
  const signature = sign(data)
  return `${data}.${signature}`
}

export function verifyAdminToken(token: string): AdminPayload | null {
  const parts = token.split('.')
  if (parts.length !== 2) {
    return null
  }

  const [data, signature] = parts
  if (!verifySignature(data, signature)) {
    return null
  }

  try {
    const payload = JSON.parse(base64UrlDecode(data)) as AdminPayload
    if (!payload || typeof payload !== 'object') {
      return null
    }
    if (payload.exp < Date.now()) {
      return null
    }
    return payload
  } catch {
    return null
  }
}

export function createAuthCookie(payload: AdminPayload) {
  const token = createAdminToken(payload)
  const secure = process.env.NODE_ENV === 'production' ? 'Secure; ' : ''
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${AUTH_MAX_AGE}; ${secure}`
}

export function clearAuthCookie() {
  const secure = process.env.NODE_ENV === 'production' ? 'Secure; ' : ''
  return `${COOKIE_NAME}=deleted; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; ${secure}`
}

export function getAdminAuth(request: NextRequest) {
  const cookie = request.cookies.get(COOKIE_NAME)?.value
  if (!cookie) {
    return null
  }
  return verifyAdminToken(cookie)
}

export function requireAdminAuth(request: NextRequest) {
  return getAdminAuth(request)
}

export function validateAdminCredentials(username: string, password: string) {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    return {
      username,
      role: 'admin' as AdminRole,
    }
  }
  return null
}
