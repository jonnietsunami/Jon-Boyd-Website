import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db, siteContent } from '../db'

// Get site content (bio, hero text)
export const getSiteContent = createServerFn({ method: 'GET' }).handler(
  async () => {
    const [content] = await db.select().from(siteContent).limit(1)
    if (!content) throw new Error('Site content not found')

    // Map to snake_case for frontend compatibility
    return {
      id: content.id,
      bio_text: content.bioText,
      hero_title: content.heroTitle,
      hero_subtitle: content.heroSubtitle,
      created_at: content.createdAt,
      updated_at: content.updatedAt,
    }
  }
)

// Update site content (admin only)
export const updateSiteContent = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      bio_text: z.string().optional(),
      hero_title: z.string().optional(),
      hero_subtitle: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    await db
      .update(siteContent)
      .set({
        ...(data.bio_text !== undefined && { bioText: data.bio_text }),
        ...(data.hero_title !== undefined && { heroTitle: data.hero_title }),
        ...(data.hero_subtitle !== undefined && { heroSubtitle: data.hero_subtitle }),
        updatedAt: new Date(),
      })
      .where(eq(siteContent.id, '00000000-0000-0000-0000-000000000001'))

    return { success: true }
  })
