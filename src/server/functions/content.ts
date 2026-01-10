import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getSupabaseServerClient } from '../supabase'

// Get site content (bio, hero text)
export const getSiteContent = createServerFn({ method: 'GET' }).handler(
  async () => {
    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .single()

    if (error) throw error
    return data
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
    const supabase = getSupabaseServerClient()
    const { error } = await supabase
      .from('site_content')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', '00000000-0000-0000-0000-000000000001')

    if (error) throw error
    return { success: true }
  })
