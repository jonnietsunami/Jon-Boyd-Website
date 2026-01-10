import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getSupabaseServerClient } from '../supabase'

// Get active videos (public)
export const getActiveVideos = createServerFn({ method: 'GET' }).handler(
  async () => {
    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('is_active', true)
      .order('display_order')

    if (error) throw error
    return data ?? []
  }
)

// Get all videos (admin)
export const getAllVideos = createServerFn({ method: 'GET' }).handler(
  async () => {
    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('display_order')

    if (error) throw error
    return data ?? []
  }
)

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

// Create video
export const createVideo = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      title: z.string(),
      description: z.string().optional(),
      youtube_url: z.string(), // Accept URL or ID
      display_order: z.number().optional(),
    })
  )
  .handler(async ({ data }) => {
    const youtube_id = extractYouTubeId(data.youtube_url)
    if (!youtube_id) {
      throw new Error('Invalid YouTube URL or ID')
    }

    const supabase = getSupabaseServerClient()
    const { error } = await supabase.from('videos').insert({
      title: data.title,
      description: data.description,
      youtube_id,
      display_order: data.display_order,
    })

    if (error) throw error
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

    // If youtube_url provided, extract the ID
    if (youtube_url) {
      const youtube_id = extractYouTubeId(youtube_url)
      if (!youtube_id) {
        throw new Error('Invalid YouTube URL or ID')
      }
      ;(updates as Record<string, unknown>).youtube_id = youtube_id
    }

    const supabase = getSupabaseServerClient()
    const { error } = await supabase
      .from('videos')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
    return { success: true }
  })

// Delete video
export const deleteVideo = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient()
    const { error } = await supabase.from('videos').delete().eq('id', data.id)

    if (error) throw error
    return { success: true }
  })
