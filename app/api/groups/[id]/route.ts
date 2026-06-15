import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Group, Profile } from '@/types/database.types'

export type MemberWithProfile = {
  role: 'admin' | 'member'
  joined_at: string
  profile: Pick<Profile, 'id' | 'full_name' | 'username' | 'avatar_url'> | null
}

export type GroupDetail = Group & { members: MemberWithProfile[] }

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('groups')
    .select(
      '*, members:group_members(role, joined_at, profile:profiles!group_members_user_id_fkey(id, full_name, username, avatar_url))'
    )
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })

  return NextResponse.json(data as unknown as GroupDetail)
}
