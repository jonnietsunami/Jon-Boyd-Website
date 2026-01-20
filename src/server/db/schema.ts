import { pgTable, uuid, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core'

// Site Content - singleton table
export const siteContent = pgTable('site_content', {
  id: uuid('id').primaryKey().defaultRandom(),
  bioText: text('bio_text').notNull().default(''),
  heroTitle: text('hero_title').notNull().default('Jon Boyd'),
  heroSubtitle: text('hero_subtitle').default(''),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// Social Links
export const socialLinks = pgTable('social_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  platform: text('platform').notNull(),
  url: text('url').notNull(),
  displayOrder: integer('display_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// Videos
export const videos = pgTable('videos', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  youtubeId: text('youtube_id').notNull(),
  displayOrder: integer('display_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// Email Subscribers
export const emailSubscribers = pgTable('email_subscribers', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  firstName: text('first_name'),
  subscribedAt: timestamp('subscribed_at', { withTimezone: true }).notNull().defaultNow(),
  isActive: boolean('is_active').notNull().default(true),
  source: text('source').notNull().default('website'),
})

// Admin Users - stores password_hash directly
export const adminUsers = pgTable('admin_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// Sessions - for session-based auth
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  adminUserId: uuid('admin_user_id').notNull().references(() => adminUsers.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// Type exports
export type SiteContent = typeof siteContent.$inferSelect
export type SocialLink = typeof socialLinks.$inferSelect
export type Video = typeof videos.$inferSelect
export type EmailSubscriber = typeof emailSubscribers.$inferSelect
export type AdminUser = typeof adminUsers.$inferSelect
export type Session = typeof sessions.$inferSelect
