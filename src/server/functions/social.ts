import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getSupabaseServerClient } from '../supabase'

// Get active social links (public)
export const getSocialLinks = createServerFn({ method: 'GET' }).handler(
  async () => {
    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase
      .from('social_links')
      .select('*')
      .eq('is_active', true)
      .order('display_order')

    if (error) throw error
    return data ?? []
  }
)

// Get all social links (admin)
export const getAllSocialLinks = createServerFn({ method: 'GET' }).handler(
  async () => {
    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase
      .from('social_links')
      .select('*')
      .order('display_order')

    if (error) throw error
    return data ?? []
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
    const supabase = getSupabaseServerClient()
    const { error } = await supabase.from('social_links').insert(data)

    if (error) throw error
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
    const supabase = getSupabaseServerClient()
    const { error } = await supabase
      .from('social_links')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
    return { success: true }
  })

// Delete social link
export const deleteSocialLink = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient()
    const { error } = await supabase
      .from('social_links')
      .delete()
      .eq('id', data.id)

    if (error) throw error
    return { success: true }
  })
