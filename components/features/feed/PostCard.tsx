'use client'

import { useState } from 'react'
import { Heart, MessageCircle, Share2 } from 'lucide-react'
import { Badge } from '@/components/ui'
import { Avatar } from '@/components/ui'
import { formatRelative } from '@/lib/utils/formatDate'
import { colorFromId } from '@/lib/utils/colorHash'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'
import type { PostWithAuthor } from '@/types/feed'

function getInitials(name: string | null | undefined, username: string | null | undefined): string {
  if (name) {
    const words = name.trim().split(/\s+/).filter(Boolean)
    const a = words[0]?.[0]?.toUpperCase() ?? ''
    const b = words[1]?.[0]?.toUpperCase() ?? ''
    return (a + b) || '?'
  }
  return username?.[0]?.toUpperCase() ?? '?'
}

const isStudentUnion = (post: PostWithAuthor) =>
  post.author?.username?.toLowerCase() === 'student_union' ||
  post.author?.full_name?.toLowerCase().includes('student union') === true

interface PostCardProps {
  post: PostWithAuthor
  currentUserId: string | undefined
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const [liked, setLiked] = useState(post.liked_by_user)
  const [likeCount, setLikeCount] = useState(post.likes_count)
  const supabase = createClient()

  const authorId = post.author_id ?? post.author?.id ?? ''
  const initials = getInitials(post.author?.full_name, post.author?.username)
  const displayName = post.author?.full_name ?? post.author?.username ?? 'Unknown'
  const colorClass = colorFromId(authorId)
  const union = isStudentUnion(post)

  async function toggleLike() {
    if (!currentUserId) return

    const wasLiked = liked
    // Optimistic update
    setLiked(!wasLiked)
    setLikeCount((n) => n + (wasLiked ? -1 : 1))

    const { error } = wasLiked
      ? await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', currentUserId)
      : await supabase
          .from('post_likes')
          .upsert({ post_id: post.id, user_id: currentUserId })

    if (error) {
      // Revert on failure
      setLiked(wasLiked)
      setLikeCount((n) => n + (wasLiked ? 1 : -1))
    }
  }

  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Avatar
          fallback={initials}
          className={cn('shrink-0 text-white', colorClass)}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-sm font-semibold text-gray-900">{displayName}</span>
            {union && (
              <Badge className="bg-[#EDE9FF] text-[#3B1FDB]">Student Union</Badge>
            )}
            {post.author?.year_group && (
              <span className="text-xs text-gray-400">{post.author.year_group}</span>
            )}
          </div>
          <time
            dateTime={post.created_at}
            className="text-xs text-gray-400"
            title={new Date(post.created_at).toLocaleString()}
          >
            {formatRelative(post.created_at)}
          </time>
        </div>
      </div>

      {/* Content */}
      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
        {post.content}
      </p>

      {/* Action bar */}
      <div className="mt-4 flex items-center gap-5">
        {/* Like */}
        <button
          onClick={toggleLike}
          disabled={!currentUserId}
          aria-label={liked ? 'Unlike post' : 'Like post'}
          className={cn(
            'flex items-center gap-1.5 text-sm transition-colors',
            liked
              ? 'text-rose-500 hover:text-rose-600'
              : 'text-gray-400 hover:text-rose-500'
          )}
        >
          <Heart
            className="h-4 w-4"
            fill={liked ? 'currentColor' : 'none'}
            strokeWidth={liked ? 0 : 1.5}
          />
          <span>{likeCount}</span>
        </button>

        {/* Comment */}
        <button
          aria-label="View comments"
          className="flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-[#3B1FDB]"
        >
          <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
          <span>{post.comments_count}</span>
        </button>

        {/* Share */}
        <button
          aria-label="Share post"
          className="ml-auto flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-[#3B1FDB]"
        >
          <Share2 className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>
    </article>
  )
}
