import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { PreferencesForm } from '@/components/features/studybuddy/PreferencesForm'
import { BuddyResults } from '@/components/features/studybuddy/BuddyResults'

export default async function StudyBuddyPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: myProfile } = await supabase
    .from('study_buddy_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <PageHeader
        title="Study Buddy"
        subtitle="Find students to study with based on your subjects and learning style"
      />
      {myProfile ? (
        <BuddyResults myProfile={myProfile} currentUserId={user.id} />
      ) : (
        <PreferencesForm />
      )}
    </div>
  )
}
