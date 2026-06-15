import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { Group } from '@/types/database.types'

const createSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  type: z.enum(['Study group', 'Project group', 'General']),
})

export type GroupWithRole = Group & { myRole: 'admin' | 'member' }

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('group_members')
    .select(
      'role, group:groups(id, name, description, type, is_interest_group, member_count, creator_id, created_at)'
    )
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const groups: GroupWithRole[] = (data ?? []).flatMap((row) => {
    const g = row.group as Group | null
    if (!g) return []
    return [{ ...g, myRole: row.role }]
  })

  return NextResponse.json(groups)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const parsed = createSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })

  const { name, description, type } = parsed.data

  const { data: group, error: groupErr } = await supabase
    .from('groups')
    .insert({
      name,
      description: description || null,
      type,
      creator_id: user.id,
      is_interest_group: false,
      member_count: 1,
    })
    .select()
    .single()

  if (groupErr) return NextResponse.json({ error: groupErr.message }, { status: 500 })

  const { error: memberErr } = await supabase
    .from('group_members')
    .insert({ group_id: group.id, user_id: user.id, role: 'admin' })

  if (memberErr) return NextResponse.json({ error: memberErr.message }, { status: 500 })

  return NextResponse.json(
    { group: { ...group, myRole: 'admin' } as GroupWithRole },
    { status: 201 }
  )
}
