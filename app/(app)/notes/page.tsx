import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types/database.types'
import type { NoteWithAuthor } from '@/types/notes'
import { NotesList } from '@/components/features/notes/NotesList'

export const metadata: Metadata = {
  title: 'Notes Hub',
  description: 'Browse, download, and share study notes with your classmates.',
}

export default async function NotesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: rows } = await supabase
    .from('notes')
    .select('*, author:profiles!notes_author_id_fkey(*)')
    .order('created_at', { ascending: false })

  const notes: NoteWithAuthor[] = (rows ?? []).map((row) => ({
    ...row,
    author: (row as { author?: unknown }).author as Profile | null,
  }))

  return (
    <div className="space-y-6">
      <NotesList initialNotes={notes} />
    </div>
  )
}
