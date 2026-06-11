'use client'

import { useRef, useState } from 'react'
import { type InfiniteData, useQueryClient } from '@tanstack/react-query'
import { Avatar } from '@/components/ui'
import { Button } from '@/components/ui'
import { colorFromId } from '@/lib/utils/colorHash'
import { cn } from '@/lib/utils/cn'
import { useUser } from '@/lib/hooks/useUser'
import type { PostWithAuthor, PostsPage } from '@/types/feed'

const MAX_CHARS = 500

export function CreatePost() {
  const { user, profile } = useUser()
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const firstName = profile?.full_name?.split(/\s+/)[0] ?? profile?.username ?? 'you'
  const initials =
    profile?.full_name
      ?.trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('') ||
    profile?.username?.[0]?.toUpperCase() ||
    '?'
  const colorClass = user ? colorFromId(user.id) : 'bg-gray-300'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = content.trim()
    if (!trimmed || !user || isPosting) return

    setError(null)
    setIsPosting(true)

    // Temporary ID for optimistic entry
    const tempId = crypto.randomUUID()
    const tempPost: PostWithAuthor = {
      id: tempId,
      author_id: user.id,
      content: trimmed,
      likes_count: 0,
      comments_count: 0,
      created_at: new Date().toISOString(),
      author: profile ?? null,
      liked_by_user: false,
    }

    // Optimistically prepend to first page
    queryClient.setQueryData<InfiniteData<PostsPage, string>>(
      ['posts'],
      (old) => {
        if (!old) return old
        const first = old.pages[0] ?? { posts: [], nextCursor: null }
        return {
          ...old,
          pages: [
            { ...first, posts: [tempPost, ...first.posts] },
            ...old.pages.slice(1),
          ],
        }
      }
    )

    // Clear the textarea immediately
    setContent('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmed }),
      })

      const json = (await res.json()) as { post?: PostWithAuthor; error?: string }

      if (!res.ok) {
        throw new Error(json.error ?? 'Failed to post')
      }

      const realPost = json.post
      if (realPost) {
        // Swap temp post for the real one
        queryClient.setQueryData<InfiniteData<PostsPage, string>>(
          ['posts'],
          (old) => {
            if (!old) return old
            return {
              ...old,
              pages: old.pages.map((page, idx) =>
                idx === 0
                  ? {
                      ...page,
                      posts: page.posts.map((p) =>
                        p.id === tempId ? realPost : p
                      ),
                    }
                  : page
              ),
            }
          }
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      // Remove the temp post on failure
      queryClient.setQueryData<InfiniteData<PostsPage, string>>(
        ['posts'],
        (old) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page, idx) =>
              idx === 0
                ? { ...page, posts: page.posts.filter((p) => p.id !== tempId) }
                : page
            ),
          }
        }
      )
    } finally {
      setIsPosting(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      void handleSubmit(e as unknown as React.FormEvent)
    }
  }

  function autoResize(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${e.target.scrollHeight}px`
  }

  const remaining = MAX_CHARS - content.length
  const isOverLimit = remaining < 0

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <Avatar
            fallback={initials}
            className={cn('mt-0.5 shrink-0 text-white', colorClass)}
          />
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={autoResize}
              onKeyDown={handleKeyDown}
              placeholder={`What's on your mind, ${firstName}?`}
              rows={2}
              maxLength={MAX_CHARS + 50}
              className="w-full resize-none bg-transparent text-sm leading-relaxed text-gray-800 placeholder:text-gray-400 focus:outline-none"
            />
          </div>
        </div>

        {error && (
          <p className="mt-2 text-xs text-red-600">{error}</p>
        )}

        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
          <span
            className={cn(
              'text-xs tabular-nums',
              remaining <= 50
                ? isOverLimit
                  ? 'text-red-500'
                  : 'text-orange-500'
                : 'text-gray-400'
            )}
          >
            {remaining}
          </span>

          <Button
            type="submit"
            disabled={!content.trim() || isOverLimit || isPosting || !user}
            className="bg-[#3B1FDB] px-5 text-white hover:bg-[#3018c0] focus-visible:ring-[#3B1FDB]/40 disabled:opacity-40"
            size="sm"
          >
            {isPosting ? 'Posting…' : 'Post'}
          </Button>
        </div>
      </form>
    </div>
  )
}
