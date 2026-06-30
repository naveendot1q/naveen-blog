-- ============================================================
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- 1. Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT DEFAULT '',
  content TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Approved blog readers table
--    Admin manually adds emails here to grant blog access.
CREATE TABLE IF NOT EXISTS blog_readers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT DEFAULT '',
  approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Row Level Security ─────────────────────────────────────

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_readers ENABLE ROW LEVEL SECURITY;

-- Drop old policies safely
DROP POLICY IF EXISTS "Public can read published posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated admin can do everything" ON blog_posts;
DROP POLICY IF EXISTS "Approved readers can read published posts" ON blog_posts;
DROP POLICY IF EXISTS "Admin full access blog_posts" ON blog_posts;
DROP POLICY IF EXISTS "Readers can check own approval" ON blog_readers;
DROP POLICY IF EXISTS "Admin full access blog_readers" ON blog_readers;

-- blog_posts: only approved authenticated readers can SELECT published posts
CREATE POLICY "Approved readers can read published posts"
  ON blog_posts FOR SELECT
  USING (
    published = TRUE
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM blog_readers
      WHERE email = auth.email()
      AND approved = TRUE
    )
  );

-- blog_posts: admin (your email) can do everything
CREATE POLICY "Admin full access blog_posts"
  ON blog_posts FOR ALL
  USING (auth.email() = 'naveenmeel10@gmail.com')
  WITH CHECK (auth.email() = 'naveenmeel10@gmail.com');

-- blog_readers: logged-in user can read their own row to check approval
CREATE POLICY "Readers can check own approval"
  ON blog_readers FOR SELECT
  USING (auth.email() = email);

-- blog_readers: admin can manage all rows
CREATE POLICY "Admin full access blog_readers"
  ON blog_readers FOR ALL
  USING (auth.email() = 'naveenmeel10@gmail.com')
  WITH CHECK (auth.email() = 'naveenmeel10@gmail.com');

-- ── Indexes ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS blog_posts_slug_idx ON blog_posts (slug);
CREATE INDEX IF NOT EXISTS blog_posts_published_idx ON blog_posts (published, created_at DESC);
CREATE INDEX IF NOT EXISTS blog_readers_email_idx ON blog_readers (email);

-- ── Seed: admin is always an approved reader ───────────────
INSERT INTO blog_readers (email, name, approved)
VALUES ('naveenmeel10@gmail.com', 'Naveen Meel (Admin)', TRUE)
ON CONFLICT (email) DO NOTHING;

-- ── Seed: sample blog post ─────────────────────────────────
INSERT INTO blog_posts (title, slug, excerpt, content, tags, published)
VALUES (
  'Hello World — My Cloud Journey',
  'hello-world-cloud-journey',
  'A quick intro to my blog and what I plan to write about — cloud infrastructure, DevOps pipelines, and everything in between.',
  E'# Hello World\n\nWelcome to my blog! I''m **Naveen Meel**, a Network and Cloud Engineer based in Gurugram, India.\n\n## What I''ll write about\n\n- AWS infrastructure patterns\n- CI/CD with Jenkins & GitLab\n- Terraform tips and production gotchas\n- MPLS and enterprise networking\n- Docker & Kubernetes in practice\n\n## Why this blog?\n\nI learn best by writing.\n\n```bash\nterraform init && terraform plan\n```\n',
  ARRAY['devops', 'cloud', 'intro'],
  TRUE
)
ON CONFLICT (slug) DO NOTHING;

-- ── 3. Reading tracker ─────────────────────────────────────
-- Tracks scroll progress per reader per post per day.
-- progress: 0.25=25%, 0.5=50%, 0.75=75%, 1.0=100%
CREATE TABLE IF NOT EXISTS blog_reads (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reader_email TEXT NOT NULL,
  post_slug    TEXT NOT NULL,
  read_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  progress     NUMERIC(3,2) NOT NULL DEFAULT 0
               CHECK (progress >= 0 AND progress <= 1),
  UNIQUE (reader_email, post_slug, read_date)
);

ALTER TABLE blog_reads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Readers can insert own reads"  ON blog_reads;
DROP POLICY IF EXISTS "Readers can update own reads"  ON blog_reads;
DROP POLICY IF EXISTS "Readers can read own reads"    ON blog_reads;
DROP POLICY IF EXISTS "Admin full access blog_reads"  ON blog_reads;

-- Reader can only see/write their own rows
CREATE POLICY "Readers can insert own reads"
  ON blog_reads FOR INSERT
  WITH CHECK (auth.email() = reader_email);

CREATE POLICY "Readers can update own reads"
  ON blog_reads FOR UPDATE
  USING (auth.email() = reader_email)
  WITH CHECK (auth.email() = reader_email);

CREATE POLICY "Readers can read own reads"
  ON blog_reads FOR SELECT
  USING (auth.email() = reader_email);

-- Admin sees everything
CREATE POLICY "Admin full access blog_reads"
  ON blog_reads FOR ALL
  USING (auth.email() = 'naveenmeel10@gmail.com')
  WITH CHECK (auth.email() = 'naveenmeel10@gmail.com');

CREATE INDEX IF NOT EXISTS blog_reads_email_date_idx ON blog_reads (reader_email, read_date);
CREATE INDEX IF NOT EXISTS blog_reads_slug_idx       ON blog_reads (post_slug);

-- ── Quiz data column ────────────────────────────────────────
-- Stores the quiz JSON directly on the post row so admin uploads
-- persist immediately without needing a code redeploy.
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS quiz_data JSONB DEFAULT NULL;

-- ── Attach a sample quiz to the seed post (safe to re-run) ──
UPDATE blog_posts
SET quiz_data = '{
  "questions": [
    {
      "q": "Which AWS service provides scalable object storage?",
      "options": ["EC2", "RDS", "S3", "VPC"],
      "answer": 2,
      "explain": "Amazon S3 (Simple Storage Service) is AWS''s scalable object storage service."
    },
    {
      "q": "What does IaC stand for in DevOps?",
      "options": ["Internet as Code", "Infrastructure as Code", "Integration as Code", "Instance as Code"],
      "answer": 1,
      "explain": "IaC means managing infrastructure through config files rather than manual processes."
    },
    {
      "q": "Which tool is used for container orchestration?",
      "options": ["Terraform", "Ansible", "Kubernetes", "Jenkins"],
      "answer": 2,
      "explain": "Kubernetes (K8s) is the industry-standard container orchestration platform."
    }
  ]
}'::jsonb
WHERE slug = 'hello-world-cloud-journey' AND quiz_data IS NULL;
