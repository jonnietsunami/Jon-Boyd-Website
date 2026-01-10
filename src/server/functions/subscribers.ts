import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getSupabaseServerClient } from '../supabase'

// Subscribe to email list (public)
export const subscribeEmail = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      email: z.string().email(),
      first_name: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient()
    const { error } = await supabase.from('email_subscribers').upsert(
      {
        email: data.email.toLowerCase(),
        first_name: data.first_name,
      },
      { onConflict: 'email' }
    )

    if (error) throw error
    return { success: true }
  })

// Get all subscribers (admin)
export const getSubscribers = createServerFn({ method: 'GET' }).handler(
  async () => {
    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase
      .from('email_subscribers')
      .select('*')
      .order('subscribed_at', { ascending: false })

    if (error) throw error
    return data ?? []
  }
)

// Export subscribers as CSV (admin)
export const exportSubscribersCSV = createServerFn({ method: 'GET' }).handler(
  async () => {
    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase
      .from('email_subscribers')
      .select('email, first_name, subscribed_at')
      .eq('is_active', true)
      .order('subscribed_at', { ascending: false })

    if (error) throw error

    // Format as CSV
    const csv = [
      'Email,First Name,Subscribed Date',
      ...(data ?? []).map(
        (s) => `${s.email},${s.first_name || ''},${s.subscribed_at}`
      ),
    ].join('\n')

    return csv
  }
)

// Delete subscriber (admin)
export const deleteSubscriber = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient()
    const { error } = await supabase
      .from('email_subscribers')
      .delete()
      .eq('id', data.id)

    if (error) throw error
    return { success: true }
  })
