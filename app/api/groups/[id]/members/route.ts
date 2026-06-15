import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function syncMemberCount(supabase: Awaited<ReturnType<typeof createClient>>, groupId: string) {
  const { count } = await supabase
    .from('group_members')
    .select('*', { count: 'exact', head: true })
    .eq('group_id', groupId)

  await supabase
    .from('groups')
    .update({ member_count: count ?? 0 })
    .eq('id', groupId)
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('group_members')
    .insert({ group_id: id, user_id: user.id, role: 'member' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await syncMemberCount(supabase, id)
  return NextResponse.json({ ok: true }, { status: 201 })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await syncMemberCount(supabase, id)
  return NextResponse.json({ ok: true })
}
