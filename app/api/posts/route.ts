import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { PostWithAuthor, PostsPage } from '@/types/feed'
import { FEED_PAGE_SIZE } from '@/types/feed'

// -----------------------------------------------------------------------
// GET /api/posts?cursor=<iso>&limit=20
// Returns a paginated page of posts with author profile joined.
// -----------------------------------------------------------------------
export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const cursor = searchParams.get('cursor')
  const limit = Math.min(
    parseInt(searchParams.get('limit') ?? String(FEED_PAGE_SIZE), 10),
    50
  )

  let query = supabase
    .from('posts')
    .select('*, author:profiles!author_id(*)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (cursor) {
    query = query.lt('created_at', cursor)
  }

  const { data: rows, error } = await query

  if (error) {
    console.error('[GET /api/posts] Supabase error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }

  const posts = rows ?? []

  // Fetch which posts the current user has liked in one round-trip
  const postIds = posts.map((p) => p.id)
  const { data: likesRows } = postIds.length
    ? await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds)
    : { data: [] }

  const likedSet = new Set((likesRows ?? []).map((l) => l.post_id))

  const postsWithMeta: PostWithAuthor[] = posts.map((p) => ({
    ...(p as Omit<typeof p, 'author'> & { author: typeof p.author }),
    author: (p as { author?: unknown }).author as PostWithAuthor['author'],
    liked_by_user: likedSet.has(p.id),
  }))

  const lastPost = postsWithMeta.at(-1)
  const nextCursor: string | null =
    postsWithMeta.length === limit && lastPost
      ? lastPost.created_at
      : null

  const page: PostsPage = { posts: postsWithMeta, nextCursor }
  return Response.json(page)
}

// -----------------------------------------------------------------------
// POST /api/posts
// Creates a new post for the authenticated user.
// -----------------------------------------------------------------------
const createSchema = z.object({
  content: z
    .string()
    .min(1, 'Post cannot be empty')
    .max(500, 'Post must be 500 characters or fewer'),
})

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid input'
    return Response.json({ error: message }, { status: 400 })
  }

  const { data: row, error } = await supabase
    .from('posts')
    .insert({ author_id: user.id, content: parsed.data.content })
    .select('*, author:profiles!author_id(*)')
    .single()

  if (error || !row) {
    return Response.json(
      { error: error?.message ?? 'Insert failed' },
      { status: 500 }
    )
  }

  const post: PostWithAuthor = {
    ...(row as Omit<typeof row, 'author'>),
    author: (row as { author?: unknown }).author as PostWithAuthor['author'],
    liked_by_user: false,
  }

  return Response.json({ post }, { status: 201 })
}
