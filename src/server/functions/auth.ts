import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import {
  validateCredentials,
  createSession,
  destroySession,
  getCurrentAdmin,
} from '../auth'

// Login with email/password
export const login = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      email: z.string().email(),
      password: z.string().min(6),
    })
  )
  .handler(async ({ data }) => {
    const result = await validateCredentials(data.email, data.password)

    if (!result.success) {
      return { error: result.error }
    }

    await createSession(result.adminId)
    return { success: true }
  })

// Logout
export const logout = createServerFn({ method: 'POST' }).handler(async () => {
  await destroySession()
  return { success: true }
})

// Get current user (if authenticated and admin)
export const getCurrentUser = createServerFn({ method: 'GET' }).handler(
  async () => {
    const admin = await getCurrentAdmin()
    if (!admin) return null
    return { id: admin.id, email: admin.email }
  }
)
