import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { Post, Profile } from '@/types/database.types'

const postSchema = z.object({
  content: z.string().min(1).max(2000).trim(),
})

export type GroupPost = Post & {
  author: Pick<Profile, 'id' | 'full_name' | 'username' | 'avatar_url'> | null
}

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
    .from('posts')
    .select('*, author:profiles!posts_author_id_fkey(id, full_name, username, avatar_url)')
    .eq('group_id', id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json((data ?? []) as unknown as GroupPost[])
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const parsed = postSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })

  const { data: post, error } = await supabase
    .from('posts')
    .insert({ content: parsed.data.content, author_id: user.id, group_id: id })
    .select('*, author:profiles!posts_author_id_fkey(id, full_name, username, avatar_url)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ post: post as unknown as GroupPost }, { status: 201 })
}
