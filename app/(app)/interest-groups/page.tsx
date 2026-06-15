import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import InterestGroupsClient from '@/components/features/groups/InterestGroupsClient'

export const metadata: Metadata = {
  title: 'Interest Groups',
  description: 'Join school interest groups for Science, Music, Sports, and more.',
}

export default async function InterestGroupsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const [{ data: groups }, { data: memberships }] = await Promise.all([
    supabase
      .from('groups')
      .select('*')
      .eq('is_interest_group', true)
      .order('name', { ascending: true }),

    supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', user.id),
  ])

  const memberGroupIds = (memberships ?? []).map((m) => m.group_id)

  return (
    <div className="space-y-6">
      <InterestGroupsClient groups={groups ?? []} memberGroupIds={memberGroupIds} />
    </div>
  )
}
