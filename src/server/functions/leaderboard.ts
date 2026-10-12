import { createServerFn } from '@tanstack/react-start'
import { sql } from 'drizzle-orm'
import { z } from 'zod'
import { db, emailSubscribers } from '../db'

// Isolated, additive table: preview deployments can initialize without altering site tables.
let setup: Promise<unknown> | undefined
function ensureLeaderboard() {
  return setup ??= db.execute(sql`CREATE TABLE IF NOT EXISTS tough_crowd_scores (
    id uuid PRIMARY KEY,
    initials varchar(3) NOT NULL CHECK (initials ~ '^[A-Z]{3}$'),
    email text NOT NULL,
    score integer NOT NULL CHECK (score BETWEEN 0 AND 30000),
    created_at timestamptz NOT NULL DEFAULT now()
  )`).catch(error => { setup = undefined; throw error })
}

export const scoreInput = z.object({
  id: z.string().uuid(),
  initials: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/, 'Enter three letters.'),
  email: z.string().trim().email().max(254).toLowerCase(),
  score: z.number().int().min(0).max(30000),
  subscribe: z.boolean().default(false),
})

export const getGameLeaderboard = createServerFn({ method: 'GET' }).handler(async () => {
  await ensureLeaderboard()
  const rows = await db.execute(sql`SELECT initials, score FROM tough_crowd_scores ORDER BY score DESC, created_at ASC, id ASC LIMIT 10`)
  // Never expose email addresses or submission IDs in a public response.
  return Array.from(rows, row => ({ initials: String(row.initials), score: Number(row.score) }))
})

export const submitGameScore = createServerFn({ method: 'POST' })
  .inputValidator(scoreInput)
  .handler(async ({ data }) => {
    await ensureLeaderboard()
    await db.transaction(async tx => {
      const inserted = await tx.execute(sql`INSERT INTO tough_crowd_scores (id, initials, email, score)
        VALUES (${data.id}::uuid, ${data.initials}, ${data.email}, ${data.score})
        ON CONFLICT (id) DO NOTHING RETURNING id`)
      if (inserted.length && data.subscribe) {
        await tx.insert(emailSubscribers).values({ email: data.email, source: 'tough-crowd' })
          .onConflictDoUpdate({ target: emailSubscribers.email, set: { isActive: true } })
      }
    })
    return { success: true }
  })
