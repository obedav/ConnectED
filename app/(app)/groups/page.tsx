import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import GroupsClient from '@/components/features/groups/GroupsClient'

export const metadata: Metadata = {
  title: 'My Groups',
  description: 'View and manage the study and project groups you belong to.',
}
import type { GroupWithRole } from '@/app/api/groups/route'
import type { Group } from '@/types/database.types'

export default async function GroupsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('group_members')
    .select(
      'role, group:groups(id, name, description, type, is_interest_group, member_count, creator_id, created_at)'
    )
    .eq('user_id', user.id)

  const groups: GroupWithRole[] = (data ?? []).flatMap((row) => {
    const g = row.group as Group | null
    if (!g) return []
    return [{ ...g, myRole: row.role }]
  })

  return (
    <div className="space-y-6">
      <GroupsClient initialGroups={groups} />
    </div>
  )
}
