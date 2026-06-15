import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { PeerTutor, Profile } from '@/types/database.types'

export type TutorWithProfile = PeerTutor & {
  profile: Profile | null
}

// -----------------------------------------------------------------------
// GET /api/tutors
// Returns all peer tutors with profile joined, ordered by rating DESC.
// -----------------------------------------------------------------------
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: rows, error } = await supabase
    .from('peer_tutors')
    .select('*, profile:profiles!peer_tutors_user_id_fkey(*)')
    .order('rating', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const tutors: TutorWithProfile[] = (rows ?? []).map((row) => ({
    ...row,
    profile: (row as { profile?: unknown }).profile as Profile | null,
  }))

  return Response.json(tutors)
}

// -----------------------------------------------------------------------
// POST /api/tutors
// Registers the current user as a peer tutor.
// -----------------------------------------------------------------------
const registerSchema = z.object({
  subjects: z.array(z.string().min(1)).min(1, 'Add at least one subject'),
  bio: z.string().max(200).optional(),
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

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid input'
    return Response.json({ error: message }, { status: 400 })
  }

  const { data: row, error } = await supabase
    .from('peer_tutors')
    .insert({
      user_id: user.id,
      subjects: parsed.data.subjects,
      bio: parsed.data.bio ?? null,
    })
    .select('*, profile:profiles!peer_tutors_user_id_fkey(*)')
    .single()

  if (error || !row) {
    return Response.json({ error: error?.message ?? 'Insert failed' }, { status: 500 })
  }

  const tutor: TutorWithProfile = {
    ...row,
    profile: (row as { profile?: unknown }).profile as Profile | null,
  }

  return Response.json({ tutor }, { status: 201 })
}
