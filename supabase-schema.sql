-- Jon Boyd Comedian Website Database Schema
-- Run this in your Supabase SQL Editor

-- ============================================
-- SITE CONTENT (singleton for bio, hero text)
-- ============================================
CREATE TABLE site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bio_text TEXT NOT NULL DEFAULT '',
  hero_title TEXT NOT NULL DEFAULT 'Jon Boyd',
  hero_subtitle TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert singleton row
INSERT INTO site_content (id, bio_text, hero_title, hero_subtitle)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Comedian. Writer. Storyteller.',
  'Jon Boyd',
  'Comedian'
);

-- ============================================
-- SOCIAL LINKS
-- ============================================
CREATE TABLE social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_social_links_order ON social_links(display_order);

-- ============================================
-- VIDEOS (YouTube only)
-- ============================================
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  youtube_id TEXT NOT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_videos_order ON videos(display_order);

-- ============================================
-- EMAIL SUBSCRIBERS
-- ============================================
CREATE TABLE email_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  source TEXT DEFAULT 'website'
);

CREATE INDEX idx_subscribers_email ON email_subscribers(email);

-- ============================================
-- ADMIN USERS (for flexible admin access)
-- ============================================
CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- HELPER FUNCTION: Check if user is admin
-- ============================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Site Content: Public read, admin write
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read site content"
  ON site_content FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can update site content"
  ON site_content FOR UPDATE
  TO authenticated
  USING (is_admin());

-- Social Links: Public read active, admin full access
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active social links"
  ON social_links FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admin can read all social links"
  ON social_links FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admin can insert social links"
  ON social_links FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admin can update social links"
  ON social_links FOR UPDATE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admin can delete social links"
  ON social_links FOR DELETE
  TO authenticated
  USING (is_admin());

-- Videos: Public read active, admin full access
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active videos"
  ON videos FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admin can read all videos"
  ON videos FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admin can insert videos"
  ON videos FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admin can update videos"
  ON videos FOR UPDATE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admin can delete videos"
  ON videos FOR DELETE
  TO authenticated
  USING (is_admin());

-- Email Subscribers: Anyone can subscribe, admin can read/manage
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe"
  ON email_subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admin can read subscribers"
  ON email_subscribers FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admin can update subscribers"
  ON email_subscribers FOR UPDATE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admin can delete subscribers"
  ON email_subscribers FOR DELETE
  TO authenticated
  USING (is_admin());

-- Admin Users: Only admins can see other admins
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can read admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (is_admin());

-- ============================================
-- AFTER SETUP: Add your admin user
-- ============================================
-- 1. Create a user in Supabase Dashboard > Authentication > Users
-- 2. Copy their UUID and run:
-- INSERT INTO admin_users (id, email) VALUES ('user-uuid-here', 'milesrhowens@gmail.com');
