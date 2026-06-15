import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { NoteWithAuthor } from '@/types/notes'
import type { Profile } from '@/types/database.types'

// -----------------------------------------------------------------------
// GET /api/notes
// Returns all notes ordered by created_at DESC, joined with author profile.
// -----------------------------------------------------------------------
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: rows, error } = await supabase
    .from('notes')
    .select('*, author:profiles!notes_author_id_fkey(*)')
    .order('created_at', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const notes: NoteWithAuthor[] = (rows ?? []).map((row) => ({
    ...row,
    author: (row as { author?: unknown }).author as Profile | null,
  }))

  return Response.json(notes)
}

// -----------------------------------------------------------------------
// POST /api/notes
// Inserts a new note record (file already uploaded to storage by the client).
// -----------------------------------------------------------------------
const createSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  subject: z.string().min(1, 'Subject is required').max(100),
  file_url: z.string().url('Invalid file URL'),
  file_size_bytes: z.number().int().positive().optional(),
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
    .from('notes')
    .insert({
      author_id: user.id,
      title: parsed.data.title,
      subject: parsed.data.subject,
      file_url: parsed.data.file_url,
      file_size_bytes: parsed.data.file_size_bytes ?? null,
    })
    .select('*, author:profiles!notes_author_id_fkey(*)')
    .single()

  if (error || !row) {
    return Response.json({ error: error?.message ?? 'Insert failed' }, { status: 500 })
  }

  const note: NoteWithAuthor = {
    ...row,
    author: (row as { author?: unknown }).author as Profile | null,
  }

  return Response.json({ note }, { status: 201 })
}
