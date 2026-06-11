import { createClient } from '@/lib/supabase/server'
import { FeedList } from '@/components/features/feed/FeedList'
import type { PostWithAuthor } from '@/types/feed'
import { FEED_PAGE_SIZE } from '@/types/feed'

export default async function FeedPage() {
  const supabase = await createClient()

  const [{ data: { user } }, { data: rows }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('posts')
      .select('*, author:profiles(*)')
      .order('created_at', { ascending: false })
      .limit(FEED_PAGE_SIZE),
  ])

  const posts = rows ?? []

  // Resolve which posts the current user has liked
  let likedSet = new Set<string>()
  if (user && posts.length > 0) {
    const { data: likes } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('user_id', user.id)
      .in('post_id', posts.map((p) => p.id))

    likedSet = new Set((likes ?? []).map((l) => l.post_id))
  }

  const initialPosts: PostWithAuthor[] = posts.map((p) => ({
    id: p.id,
    author_id: p.author_id,
    content: p.content,
    likes_count: p.likes_count,
    comments_count: p.comments_count,
    created_at: p.created_at,
    author: (p as { author?: PostWithAuthor['author'] }).author ?? null,
    liked_by_user: likedSet.has(p.id),
  }))

  return (
    <div className="mx-auto w-full max-w-2xl">
      <FeedList initialPosts={initialPosts} />
    </div>
  )
}
