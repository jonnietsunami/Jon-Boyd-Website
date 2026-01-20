import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { siteContent, adminUsers } from './schema'
import { hashPassword } from '../auth'

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set')
    process.exit(1)
  }

  const client = postgres(process.env.DATABASE_URL)
  const db = drizzle(client)

  console.log('Seeding database...')

  // Insert singleton site content row
  await db
    .insert(siteContent)
    .values({
      id: '00000000-0000-0000-0000-000000000001',
      bioText: 'Comedian. Writer. Storyteller.',
      heroTitle: 'Jon Boyd',
      heroSubtitle: 'Comedian',
    })
    .onConflictDoNothing()

  console.log('✓ Site content seeded')

  // Insert admin user
  const email = process.env.ADMIN_EMAIL || 'admin@example.com'
  const password = process.env.ADMIN_PASSWORD || 'changeme123'

  const passwordHash = await hashPassword(password)
  await db
    .insert(adminUsers)
    .values({
      email: email.toLowerCase(),
      passwordHash,
    })
    .onConflictDoNothing()

  console.log(`✓ Admin user seeded (${email})`)
  console.log('\nDone!')

  await client.end()
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
