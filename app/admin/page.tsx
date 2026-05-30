import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Only allow admin email
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'naveenmeel10@gmail.com'
  if (user.email !== adminEmail) {
    redirect('/')
  }

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('id, title, slug, published, created_at, tags')
    .order('created_at', { ascending: false })

  return <AdminClient posts={posts || []} userEmail={user.email || ''} />
}
