import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { StudentsClient } from '@/components/features/students/StudentsClient'
import type { ProfileWithStats } from '@/components/features/students/StudentsClient'

export const metadata: Metadata = {
  title: 'Students League',
  description: 'Discover your classmates and see who\'s leading the community.',
}

export default async function StudentsPage() {
  const supabase = await createClient()

  const [
    { data: profiles },
    { data: allPosts },
    { data: allNotes },
    { data: allConnections },
  ] = await Promise.all([
    supabase.from('profiles').select('*'),
    supabase.from('posts').select('author_id'),
    supabase.from('notes').select('author_id'),
    supabase
      .from('buddy_connections')
      .select('requester_id, receiver_id')
      .eq('status', 'accepted'),
  ])

  const postMap = new Map<string, number>()
  for (const p of allPosts ?? []) {
    if (p.author_id) postMap.set(p.author_id, (postMap.get(p.author_id) ?? 0) + 1)
  }

  const noteMap = new Map<string, number>()
  for (const n of allNotes ?? []) {
    if (n.author_id) noteMap.set(n.author_id, (noteMap.get(n.author_id) ?? 0) + 1)
  }

  const connMap = new Map<string, number>()
  for (const c of allConnections ?? []) {
    if (c.requester_id) connMap.set(c.requester_id, (connMap.get(c.requester_id) ?? 0) + 1)
    if (c.receiver_id)  connMap.set(c.receiver_id,  (connMap.get(c.receiver_id)  ?? 0) + 1)
  }

  const profilesWithStats: ProfileWithStats[] = (profiles ?? []).map((p) => {
    const posts = postMap.get(p.id) ?? 0
    const notes = noteMap.get(p.id) ?? 0
    const conns = connMap.get(p.id) ?? 0
    return {
      id: p.id,
      username: p.username,
      full_name: p.full_name,
      avatar_url: p.avatar_url,
      year_group: p.year_group,
      house: p.house,
      bio: p.bio,
      post_count: posts,
      note_count: notes,
      connection_count: conns,
      score: posts * 2 + notes * 3 + conns,
    }
  })

  return <StudentsClient profiles={profilesWithStats} />
}
