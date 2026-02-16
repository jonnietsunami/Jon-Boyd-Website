import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { eq, desc } from 'drizzle-orm'
import { db, emailSubscribers } from '../db'

// Map to snake_case for frontend compatibility
function mapSubscriber(sub: typeof emailSubscribers.$inferSelect) {
  return {
    id: sub.id,
    email: sub.email,
    first_name: sub.firstName,
    subscribed_at: sub.subscribedAt,
    is_active: sub.isActive,
    source: sub.source,
  }
}

// Subscribe to email list (public)
export const subscribeEmail = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      email: z.string().email(),
      first_name: z.string().optional(),
      website: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    if (data.website) return { success: true }

    await db
      .insert(emailSubscribers)
      .values({
        email: data.email.toLowerCase(),
        firstName: data.first_name,
      })
      .onConflictDoUpdate({
        target: emailSubscribers.email,
        set: {
          firstName: data.first_name,
          isActive: true,
        },
      })

    return { success: true }
  })

// Get all subscribers (admin)
export const getSubscribers = createServerFn({ method: 'GET' }).handler(
  async () => {
    const subscribers = await db
      .select()
      .from(emailSubscribers)
      .orderBy(desc(emailSubscribers.subscribedAt))

    return subscribers.map(mapSubscriber)
  }
)

// Export subscribers as CSV (admin)
export const exportSubscribersCSV = createServerFn({ method: 'GET' }).handler(
  async () => {
    const subscribers = await db
      .select({
        email: emailSubscribers.email,
        firstName: emailSubscribers.firstName,
        subscribedAt: emailSubscribers.subscribedAt,
      })
      .from(emailSubscribers)
      .where(eq(emailSubscribers.isActive, true))
      .orderBy(desc(emailSubscribers.subscribedAt))

    // Format as CSV
    const csv = [
      'Email,First Name,Subscribed Date',
      ...subscribers.map(
        (s) => `${s.email},${s.firstName || ''},${s.subscribedAt?.toISOString() || ''}`
      ),
    ].join('\n')

    return csv
  }
)

// Delete subscriber (admin)
export const deleteSubscriber = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    await db.delete(emailSubscribers).where(eq(emailSubscribers.id, data.id))
    return { success: true }
  })
