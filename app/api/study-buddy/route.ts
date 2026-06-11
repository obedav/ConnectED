import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { StudyBuddyProfile, Profile } from '@/types/database.types'

export type StudyBuddyProfileWithUser = StudyBuddyProfile & {
  profile: Profile | null
}

// -----------------------------------------------------------------------
// GET /api/study-buddy
// Returns all active study buddy profiles (excluding current user),
// joined with the user's profile record.
// -----------------------------------------------------------------------
export async function GET(_request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: rows, error } = await supabase
    .from('study_buddy_profiles')
    .select('*, profile:profiles!study_buddy_profiles_user_id_fkey(*)')
    .eq('is_active', true)
    .neq('user_id', user.id)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const profiles: StudyBuddyProfileWithUser[] = (rows ?? []).map((row) => ({
    ...row,
    profile: (row as { profile?: unknown }).profile as Profile | null,
  }))

  return Response.json(profiles)
}

// -----------------------------------------------------------------------
// POST /api/study-buddy
// Upserts the current user's study buddy profile (conflict on user_id).
// -----------------------------------------------------------------------
const upsertSchema = z.object({
  academic_level: z.string().min(1),
  subjects_studying: z.array(z.string().min(1)).min(1),
  subjects_needing_help: z.array(z.string().min(1)).min(1),
  study_styles: z.array(z.string().min(1)).min(1),
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

  const parsed = upsertSchema.safeParse(body)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid input'
    return Response.json({ error: message }, { status: 400 })
  }

  const { data: row, error } = await supabase
    .from('study_buddy_profiles')
    .upsert(
      { user_id: user.id, ...parsed.data, is_active: true },
      { onConflict: 'user_id' }
    )
    .select()
    .single()

  if (error || !row) {
    return Response.json({ error: error?.message ?? 'Upsert failed' }, { status: 500 })
  }

  return Response.json({ profile: row }, { status: 201 })
}
