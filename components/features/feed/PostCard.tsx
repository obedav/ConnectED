'use client'

import { useState } from 'react'
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react'
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
    setLiked(!wasLiked)
    setLikeCount((n) => n + (wasLiked ? -1 : 1))
    const { error } = wasLiked
      ? await supabase.from('post_likes').delete().eq('post_id', post.id).eq('user_id', currentUserId)
      : await supabase.from('post_likes').upsert({ post_id: post.id, user_id: currentUserId })
    if (error) {
      setLiked(wasLiked)
      setLikeCount((n) => n + (wasLiked ? 1 : -1))
    }
  }

  return (
    <article className="group rounded-2xl bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.07),0_0_0_1px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(0,0,0,0.10),0_0_0_1px_rgba(0,0,0,0.04)]">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Avatar
          fallback={initials}
          className={cn('mt-0.5 shrink-0 text-white', colorClass)}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-sm font-semibold text-gray-900">{displayName}</span>
            {union && (
              <Badge className="bg-[#F5EDE8] text-[#9B5941]">Student Union</Badge>
            )}
            {post.author?.year_group && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
                {post.author.year_group}
              </span>
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

        <button
          aria-label="More options"
          className="rounded-lg p-1 text-gray-300 opacity-0 transition-all group-hover:opacity-100 hover:bg-gray-100 hover:text-gray-500"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
        {post.content}
      </p>

      {/* Action bar */}
      <div className="mt-4 flex items-center gap-1 border-t border-gray-50 pt-3">
        {/* Like */}
        <button
          onClick={toggleLike}
          disabled={!currentUserId}
          aria-label={liked ? 'Unlike post' : 'Like post'}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-all duration-150 active:scale-95',
            liked
              ? 'bg-rose-50 text-rose-500 hover:bg-rose-100'
              : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
          )}
        >
          <Heart
            className="h-4 w-4"
            fill={liked ? 'currentColor' : 'none'}
            strokeWidth={liked ? 0 : 1.8}
          />
          <span>{likeCount > 0 ? likeCount : ''}</span>
        </button>

        {/* Comment */}
        <button
          aria-label="View comments"
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-400 transition-all duration-150 hover:bg-gray-100 hover:text-gray-600 active:scale-95"
        >
          <MessageCircle className="h-4 w-4" strokeWidth={1.8} />
          <span>{post.comments_count > 0 ? post.comments_count : ''}</span>
        </button>

        {/* Share */}
        <button
          aria-label="Share post"
          className="ml-auto flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-400 transition-all duration-150 hover:bg-gray-100 hover:text-gray-600 active:scale-95"
        >
          <Share2 className="h-4 w-4" strokeWidth={1.8} />
        </button>
      </div>
    </article>
  )
}
