import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { eq, asc } from 'drizzle-orm'
import { db, videos } from '../db'

// Map to snake_case for frontend compatibility
function mapVideo(video: typeof videos.$inferSelect) {
  return {
    id: video.id,
    title: video.title,
    description: video.description,
    youtube_id: video.youtubeId,
    display_order: video.displayOrder,
    is_active: video.isActive,
    created_at: video.createdAt,
    updated_at: video.updatedAt,
  }
}

// Helper to extract YouTube video ID from various URL formats
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct ID
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

// Get active videos (public)
export const getActiveVideos = createServerFn({ method: 'GET' }).handler(
  async () => {
    const videoList = await db
      .select()
      .from(videos)
      .where(eq(videos.isActive, true))
      .orderBy(asc(videos.displayOrder))

    return videoList.map(mapVideo)
  }
)

// Get all videos (admin)
export const getAllVideos = createServerFn({ method: 'GET' }).handler(
  async () => {
    const videoList = await db
      .select()
      .from(videos)
      .orderBy(asc(videos.displayOrder))

    return videoList.map(mapVideo)
  }
)

// Create video
export const createVideo = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      title: z.string(),
      description: z.string().optional(),
      youtube_url: z.string(),
      display_order: z.number().optional(),
    })
  )
  .handler(async ({ data }) => {
    const youtubeId = extractYouTubeId(data.youtube_url)
    if (!youtubeId) {
      throw new Error('Invalid YouTube URL or ID')
    }

    await db.insert(videos).values({
      title: data.title,
      description: data.description,
      youtubeId,
      displayOrder: data.display_order,
    })

    return { success: true }
  })

// Update video
export const updateVideo = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      id: z.string().uuid(),
      title: z.string().optional(),
      description: z.string().optional(),
      youtube_url: z.string().optional(),
      display_order: z.number().optional(),
      is_active: z.boolean().optional(),
    })
  )
  .handler(async ({ data }) => {
    const { id, youtube_url, ...updates } = data

    let youtubeId: string | undefined
    if (youtube_url) {
      const extracted = extractYouTubeId(youtube_url)
      if (!extracted) {
        throw new Error('Invalid YouTube URL or ID')
      }
      youtubeId = extracted
    }

    await db
      .update(videos)
      .set({
        ...(updates.title !== undefined && { title: updates.title }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(youtubeId !== undefined && { youtubeId }),
        ...(updates.display_order !== undefined && { displayOrder: updates.display_order }),
        ...(updates.is_active !== undefined && { isActive: updates.is_active }),
        updatedAt: new Date(),
      })
      .where(eq(videos.id, id))

    return { success: true }
  })

// Delete video
export const deleteVideo = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    await db.delete(videos).where(eq(videos.id, data.id))
    return { success: true }
  })
