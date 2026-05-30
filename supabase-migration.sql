-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New query)

-- Blog posts table
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

-- Enable Row Level Security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (safe re-run)
DROP POLICY IF EXISTS "Public can read published posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated admin can do everything" ON blog_posts;

-- Anyone can read published posts
CREATE POLICY "Public can read published posts"
  ON blog_posts FOR SELECT
  USING (published = TRUE);

-- Authenticated users (admin) can do everything
CREATE POLICY "Authenticated admin can do everything"
  ON blog_posts FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Indexes
CREATE INDEX IF NOT EXISTS blog_posts_slug_idx ON blog_posts (slug);
CREATE INDEX IF NOT EXISTS blog_posts_published_idx ON blog_posts (published, created_at DESC);

-- Sample post
INSERT INTO blog_posts (title, slug, excerpt, content, tags, published)
VALUES (
  'Hello World — My Cloud Journey',
  'hello-world-cloud-journey',
  'A quick intro to my blog and what I plan to write about — cloud infrastructure, DevOps pipelines, MPLS networking, and everything in between.',
  E'# Hello World\n\nWelcome to my blog! I''m **Naveen Meel**, a Network and Cloud Engineer based in Gurugram, India.\n\n## What I''ll be writing about\n\n- AWS infrastructure patterns and architecture\n- CI/CD pipeline design with Jenkins & GitLab\n- Terraform tips, modules, and production gotchas\n- MPLS and enterprise B2B networking (Airtel)\n- Docker & Kubernetes in practice\n- Security tooling: SonarQube, Trivy, OWASP\n\n## Why this blog?\n\nI learn best by writing. This is my space to document things I figure out, experiments I run, and lessons from working at scale.\n\nStay tuned!\n\n```bash\n# A taste of what''s coming\nterraform init && terraform plan -out=tfplan\n```\n',
  ARRAY['devops', 'cloud', 'intro'],
  TRUE
)
ON CONFLICT (slug) DO NOTHING;
