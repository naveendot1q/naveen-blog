-- ============================================================
-- GitHub blog sync — run this once in the Supabase SQL Editor.
-- Additive only: existing posts and data are untouched.
-- ============================================================

-- Tracks which posts came from (or are linked to) a file in the
-- GitHub content repo, and lets the sync detect real changes instead
-- of re-writing every post on every run.
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS source_path TEXT UNIQUE;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS source_sha  TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS synced_at   TIMESTAMPTZ;

-- Bucket for images re-hosted out of the GitHub repo. Public read
-- (they need to be viewable on the live site); writes only ever
-- happen server-side with the service role key, which bypasses
-- storage policies entirely, so no INSERT policy is defined here —
-- deliberately, so no anon/authenticated client can ever upload.
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read for blog images" ON storage.objects;
CREATE POLICY "Public read for blog images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-images');
