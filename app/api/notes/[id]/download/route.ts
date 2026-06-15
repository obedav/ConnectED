import { createClient } from '@/lib/supabase/server'

// -----------------------------------------------------------------------
// POST /api/notes/[id]/download
// Atomically increments downloads_count for the given note.
// Called by the client immediately before opening the file URL.
// -----------------------------------------------------------------------
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: note, error: fetchError } = await supabase
    .from('notes')
    .select('downloads_count')
    .eq('id', id)
    .single()

  if (fetchError || !note) {
    return Response.json({ error: fetchError?.message ?? 'Note not found' }, { status: 404 })
  }

  const { error: updateError } = await supabase
    .from('notes')
    .update({ downloads_count: note.downloads_count + 1 })
    .eq('id', id)

  if (updateError) {
    return Response.json({ error: updateError.message }, { status: 500 })
  }

  return Response.json({ downloads_count: note.downloads_count + 1 })
}
