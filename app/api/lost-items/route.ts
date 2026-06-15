import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// -----------------------------------------------------------------------
// GET /api/lost-items  — returns all items, newest first
// POST /api/lost-items — creates a new lost / found item report
// -----------------------------------------------------------------------

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: items, error } = await supabase
    .from('lost_items')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json(items ?? [])
}

const createSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  location_found: z.string().max(200).optional(),
  status: z.enum(['missing', 'found']),
  image_url: z.string().url().optional(),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid input'
    return Response.json({ error: message }, { status: 400 })
  }

  const { data: row, error } = await supabase
    .from('lost_items')
    .insert({
      reporter_id: user.id,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      location_found: parsed.data.location_found ?? null,
      status: parsed.data.status,
      image_url: parsed.data.image_url ?? null,
    })
    .select()
    .single()

  if (error || !row) {
    return Response.json({ error: error?.message ?? 'Insert failed' }, { status: 500 })
  }

  return Response.json({ item: row }, { status: 201 })
}
