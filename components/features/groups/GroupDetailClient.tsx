'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Users } from 'lucide-react'
import { Avatar, Button } from '@/components/ui'
import { colorFromId } from '@/lib/utils/colorHash'
import { formatRelative } from '@/lib/utils/formatDate'
import { useGroupMembership } from '@/lib/hooks/useGroupMembership'
import { cn } from '@/lib/utils/cn'
import type { Group, Profile } from '@/types/database.types'
import type { GroupPost } from '@/app/api/groups/[id]/posts/route'

type MemberWithProfile = {
  role: 'admin' | 'member'
  joined_at: string
  profile: Pick<Profile, 'id' | 'full_name' | 'username' | 'avatar_url'> | null
}

function getInitials(fullName: string | null | undefined, username: string) {
  if (fullName) {
    const words = fullName.trim().split(/\s+/).filter(Boolean)
    return ((words[0]?.[0] ?? '') + (words[1]?.[0] ?? '')).toUpperCase() || '?'
  }
  return username[0]?.toUpperCase() ?? '?'
}

interface GroupDetailClientProps {
  group: Group
  members: MemberWithProfile[]
  initialPosts: GroupPost[]
  isMember: boolean
}

export default function GroupDetailClient({
  group,
  members,
  initialPosts,
  isMember: initialIsMember,
}: GroupDetailClientProps) {
  const router = useRouter()
  const { isMember, memberCount, isLoading, leave } = useGroupMembership(
    group.id,
    initialIsMember,
    group.member_count
  )
  const [posts, setPosts] = useState(initialPosts)
  const [postContent, setPostContent] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [confirmLeave, setConfirmLeave] = useState(false)

  async function handleLeave() {
    const success = await leave()
    if (success) router.push('/groups')
  }

  async function handlePost() {
    const trimmed = postContent.trim()
    if (!trimmed || isPosting) return
    setIsPosting(true)
    const res = await fetch(`/api/groups/${group.id}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: trimmed }),
    })
    setIsPosting(false)
    if (res.ok) {
      const { post } = (await res.json()) as { post: GroupPost }
      setPosts((prev) => [post, ...prev])
      setPostContent('')
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Group header ── */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex items-start gap-4">
          <div
            className={cn(
              'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white',
              colorFromId(group.id)
            )}
          >
            <Users className="h-7 w-7" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">{group.name}</h1>
              {group.type && (
                <span className="rounded-full bg-[#F5EDE8] px-2.5 py-0.5 text-xs font-medium text-[#9B5941]">
                  {group.type}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-sm text-gray-400">{memberCount} members</p>
            {group.description && (
              <p className="mt-2 text-sm text-gray-600">{group.description}</p>
            )}
          </div>

          {isMember && (
            <div className="shrink-0">
              {confirmLeave ? (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setConfirmLeave(false)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isLoading}
                    className="border-red-200 text-red-500 hover:bg-red-50"
                    onClick={handleLeave}
                  >
                    Confirm
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmLeave(true)}
                  className="text-gray-500 hover:border-red-200 hover:text-red-500"
                >
                  Leave Group
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* ── Members sidebar ── */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:self-start">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Members ({members.length})
          </h2>
          <div className="space-y-3">
            {members.map((m) => {
              const p = m.profile
              if (!p) return null
              const initials = getInitials(p.full_name, p.username)
              return (
                <div key={p.id} className="flex items-center gap-3">
                  <Avatar
                    src={p.avatar_url ?? undefined}
                    fallback={initials}
                    className={cn('shrink-0 text-white', !p.avatar_url && colorFromId(p.id))}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {p.full_name ?? p.username}
                    </p>
                    <p className="truncate text-xs text-gray-400">
                      @{p.username}
                      {m.role === 'admin' && ' · Admin'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Posts feed ── */}
        <div className="space-y-4">
          {/* Post composer */}
          {isMember && (
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Share something with the group…"
                rows={3}
                className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#9B5941]/30 focus:outline-none focus:ring-2 focus:ring-[#9B5941]/20"
              />
              <div className="mt-2 flex justify-end">
                <Button
                  size="sm"
                  onClick={handlePost}
                  disabled={!postContent.trim() || isPosting}
                  className="bg-[#9B5941] text-white hover:bg-[#7D4532] disabled:opacity-50"
                >
                  {isPosting ? 'Posting…' : 'Post'}
                </Button>
              </div>
            </div>
          )}

          {/* Posts list */}
          {posts.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white py-12 text-center shadow-sm">
              <p className="text-sm font-medium text-gray-500">No posts yet</p>
              <p className="text-xs text-gray-400">
                {isMember ? 'Be the first to share something!' : 'Join the group to post.'}
              </p>
            </div>
          ) : (
            posts.map((post) => {
              const author = post.author
              if (!author) return null
              const initials = getInitials(author.full_name, author.username)
              return (
                <div
                  key={post.id}
                  className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={author.avatar_url ?? undefined}
                      fallback={initials}
                      className={cn('shrink-0 text-white', !author.avatar_url && colorFromId(author.id))}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {author.full_name ?? author.username}
                      </p>
                      <p className="text-xs text-gray-400">{formatRelative(post.created_at)}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-gray-700">{post.content}</p>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
