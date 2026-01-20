import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { eq, asc } from 'drizzle-orm'
import { db, socialLinks } from '../db'

// Map to snake_case for frontend compatibility
function mapSocialLink(link: typeof socialLinks.$inferSelect) {
  return {
    id: link.id,
    platform: link.platform,
    url: link.url,
    display_order: link.displayOrder,
    is_active: link.isActive,
    created_at: link.createdAt,
    updated_at: link.updatedAt,
  }
}

// Get active social links (public)
export const getSocialLinks = createServerFn({ method: 'GET' }).handler(
  async () => {
    const links = await db
      .select()
      .from(socialLinks)
      .where(eq(socialLinks.isActive, true))
      .orderBy(asc(socialLinks.displayOrder))

    return links.map(mapSocialLink)
  }
)

// Get all social links (admin)
export const getAllSocialLinks = createServerFn({ method: 'GET' }).handler(
  async () => {
    const links = await db
      .select()
      .from(socialLinks)
      .orderBy(asc(socialLinks.displayOrder))

    return links.map(mapSocialLink)
  }
)

// Create social link
export const createSocialLink = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      platform: z.string(),
      url: z.string().url(),
      display_order: z.number().optional(),
    })
  )
  .handler(async ({ data }) => {
    await db.insert(socialLinks).values({
      platform: data.platform,
      url: data.url,
      displayOrder: data.display_order,
    })

    return { success: true }
  })

// Update social link
export const updateSocialLink = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      id: z.string().uuid(),
      platform: z.string().optional(),
      url: z.string().url().optional(),
      display_order: z.number().optional(),
      is_active: z.boolean().optional(),
    })
  )
  .handler(async ({ data }) => {
    const { id, ...updates } = data

    await db
      .update(socialLinks)
      .set({
        ...(updates.platform !== undefined && { platform: updates.platform }),
        ...(updates.url !== undefined && { url: updates.url }),
        ...(updates.display_order !== undefined && { displayOrder: updates.display_order }),
        ...(updates.is_active !== undefined && { isActive: updates.is_active }),
        updatedAt: new Date(),
      })
      .where(eq(socialLinks.id, id))

    return { success: true }
  })

// Delete social link
export const deleteSocialLink = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    await db.delete(socialLinks).where(eq(socialLinks.id, data.id))
    return { success: true }
  })
