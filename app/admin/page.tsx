import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'naveenmeel10@gmail.com'
  if (user.email !== adminEmail) redirect('/')

  // Ensure admin always exists in blog_readers (auto-heal if deleted)
  await supabase
    .from('blog_readers')
    .upsert(
      { email: adminEmail, name: 'Naveen Meel (Admin)', approved: true },
      { onConflict: 'email', ignoreDuplicates: true }
    )

  const [{ data: posts }, { data: readers }] = await Promise.all([
    supabase
      .from('blog_posts')
      .select('id, title, slug, published, created_at, tags')
      .order('created_at', { ascending: false }),
    supabase
      .from('blog_readers')
      .select('id, email, name, approved, created_at')
      .order('created_at', { ascending: false }),
  ])

  return (
    <AdminClient
      posts={posts || []}
      readers={readers || []}
      userEmail={user.email || ''}
    />
  )
}
