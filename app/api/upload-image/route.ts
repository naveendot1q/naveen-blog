import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// Sanity ceiling only — Storage/plan limits are the real cap. This just
// stops something absurd from getting a signed URL in the first place.
const MAX_BYTES = 20 * 1024 * 1024

function sanitizeFilename(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.\-]+/g, '-').replace(/-+/g, '-')
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'naveenmeel10@gmail.com'
  if (!user || user.email !== adminEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const { filename, contentType, size, folder } = body as { filename?: string; contentType?: string; size?: number; folder?: string }

  if (!filename || typeof filename !== 'string') {
    return NextResponse.json({ error: 'filename is required' }, { status: 400 })
  }
  if (contentType && !contentType.startsWith('image/')) {
    return NextResponse.json({ error: `Only image uploads are allowed (got ${contentType})` }, { status: 400 })
  }
  if (typeof size === 'number' && size > MAX_BYTES) {
    return NextResponse.json({ error: `Image too large (max ${Math.floor(MAX_BYTES / 1024 / 1024)}MB)` }, { status: 400 })
  }

  const safeFolder = (folder && folder.trim() ? folder.trim() : 'drafts').replace(/[^a-z0-9-]+/gi, '-')
  const path = `${safeFolder}/${Date.now()}-${sanitizeFilename(filename)}`

  const admin = createAdminClient()
  const { data, error } = await admin.storage.from('blog-images').createSignedUploadUrl(path)
  if (error || !data) {
    return NextResponse.json({ error: error?.message || 'Could not create upload URL' }, { status: 500 })
  }

  const { data: pub } = admin.storage.from('blog-images').getPublicUrl(path)

  return NextResponse.json({ token: data.token, path: data.path, publicUrl: pub.publicUrl })
}
