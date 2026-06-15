import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('groups').select('name').eq('id', id).single()
  return {
    title: data?.name ?? 'Group',
    description: `Discussion and posts for the ${data?.name ?? ''} group.`,
  }
}
import GroupDetailClient from '@/components/features/groups/GroupDetailClient'
import type { Group, Profile } from '@/types/database.types'
import type { GroupPost } from '@/app/api/groups/[id]/posts/route'

type MemberWithProfile = {
  role: 'admin' | 'member'
  joined_at: string
  profile: Pick<Profile, 'id' | 'full_name' | 'username' | 'avatar_url'> | null
}

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const [{ data: groupData }, { data: postsData }, { data: membershipData }] = await Promise.all([
    supabase
      .from('groups')
      .select(
        '*, members:group_members(role, joined_at, profile:profiles!group_members_user_id_fkey(id, full_name, username, avatar_url))'
      )
      .eq('id', id)
      .single(),

    supabase
      .from('posts')
      .select('*, author:profiles!posts_author_id_fkey(id, full_name, username, avatar_url)')
      .eq('group_id', id)
      .order('created_at', { ascending: false })
      .limit(50),

    supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', id)
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  if (!groupData) notFound()

  const group = groupData as unknown as Group & { members: MemberWithProfile[] }
  const members = group.members ?? []
  const posts = (postsData ?? []) as unknown as GroupPost[]
  const isMember = !!membershipData

  return (
    <GroupDetailClient
      group={group}
      members={members}
      initialPosts={posts}
      isMember={isMember}
    />
  )
}
