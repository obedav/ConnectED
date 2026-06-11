'use client'

import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { PostCard } from './PostCard'
import { CreatePost } from './CreatePost'
import { useIntersectionObserver } from '@/lib/hooks/useIntersectionObserver'
import { useUser } from '@/lib/hooks/useUser'
import type { PostWithAuthor, PostsPage } from '@/types/feed'
import { FEED_PAGE_SIZE } from '@/types/feed'

interface FeedListProps {
  initialPosts: PostWithAuthor[]
}

function buildInitialData(posts: PostWithAuthor[]): InfiniteData<PostsPage, string> {
  const lastPost = posts.at(-1)
  return {
    pages: [
      {
        posts,
        nextCursor:
          posts.length === FEED_PAGE_SIZE ? (lastPost?.created_at ?? null) : null,
      },
    ],
    pageParams: [''],
  }
}

export function FeedList({ initialPosts }: FeedListProps) {
  const { user } = useUser()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery<PostsPage, Error, InfiniteData<PostsPage, string>, ['posts'], string>({
    queryKey: ['posts'],
    queryFn: async ({ pageParam }): Promise<PostsPage> => {
      const params = new URLSearchParams({ limit: String(FEED_PAGE_SIZE) })
      if (pageParam) params.set('cursor', pageParam)
      const res = await fetch(`/api/posts?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch posts')
      return res.json() as Promise<PostsPage>
    },
    initialPageParam: '',
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialData: buildInitialData(initialPosts),
  })

  // Sentinel div at the bottom triggers loading the next page
  const sentinelRef = useIntersectionObserver(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage()
  })

  const posts = data?.pages.flatMap((page) => page.posts) ?? []

  return (
    <div className="flex flex-col gap-4">
      <CreatePost />

      {isError && (
        <p className="text-center text-sm text-red-500">
          Failed to load posts. Please refresh.
        </p>
      )}

      {isLoading && posts.length === 0 && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-[#3B1FDB]" />
        </div>
      )}

      {posts.map((post) => (
        <PostCard key={post.id} post={post} currentUserId={user?.id} />
      ))}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-1" aria-hidden="true" />

      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
      )}

      {!hasNextPage && posts.length > 0 && (
        <p className="pb-4 text-center text-xs text-gray-400">
          You've seen all the posts
        </p>
      )}
    </div>
  )
}
