export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  tags: string[]
  published: boolean
  created_at: string
  updated_at: string
}

export interface Skill {
  category: string
  items: string[]
  icon: string
}

export interface Experience {
  role: string
  company: string
  period: string
  location: string
  bullets: string[]
  current?: boolean
}
