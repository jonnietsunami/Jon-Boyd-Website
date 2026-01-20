import { randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'
import { eq, and, gt } from 'drizzle-orm'
import { getCookies, setCookie } from '@tanstack/react-start/server'
import { db, adminUsers, sessions } from '../db'

const SESSION_COOKIE_NAME = 'admin_session'
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

function generateSessionToken(): string {
  return randomBytes(32).toString('hex')
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createSession(adminUserId: string): Promise<string> {
  const token = generateSessionToken()
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)

  await db.insert(sessions).values({
    adminUserId,
    token,
    expiresAt,
  })

  setCookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_MS / 1000,
  })

  return token
}

export async function getSession() {
  const cookies = getCookies()
  const token = cookies[SESSION_COOKIE_NAME]

  if (!token) return null

  const [session] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())))
    .limit(1)

  return session || null
}

export async function getCurrentAdmin() {
  const session = await getSession()
  if (!session) return null

  const [admin] = await db
    .select({ id: adminUsers.id, email: adminUsers.email })
    .from(adminUsers)
    .where(eq(adminUsers.id, session.adminUserId))
    .limit(1)

  return admin || null
}

export async function destroySession(): Promise<void> {
  const cookies = getCookies()
  const token = cookies[SESSION_COOKIE_NAME]

  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token))
  }

  setCookie(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}

export async function validateCredentials(
  email: string,
  password: string
): Promise<{ success: true; adminId: string } | { success: false; error: string }> {
  const [admin] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, email.toLowerCase()))
    .limit(1)

  if (!admin) {
    return { success: false, error: 'Invalid credentials' }
  }

  const isValid = await verifyPassword(password, admin.passwordHash)
  if (!isValid) {
    return { success: false, error: 'Invalid credentials' }
  }

  return { success: true, adminId: admin.id }
}
