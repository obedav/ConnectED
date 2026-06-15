import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types/database.types'
import type { TutorWithProfile } from '@/app/api/tutors/route'

export const metadata: Metadata = {
  title: 'Peer Tutors',
  description: 'Book a one-to-one session with a student tutor for any subject.',
}
import { TutorsList } from '@/components/features/tutors/TutorCard'

export default async function TutorsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: rows } = await supabase
    .from('peer_tutors')
    .select('*, profile:profiles!peer_tutors_user_id_fkey(*)')
    .order('rating', { ascending: false })

  const tutors: TutorWithProfile[] = (rows ?? []).map((row) => ({
    ...row,
    profile: (row as { profile?: unknown }).profile as Profile | null,
  }))

  const isAlreadyTutor = tutors.some((t) => t.user_id === user.id)

  return (
    <div className="space-y-6">
      <TutorsList
        tutors={tutors}
        currentUserId={user.id}
        isAlreadyTutor={isAlreadyTutor}
      />
    </div>
  )
}
