'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Heart, CalendarDays, Users, FileText, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { colorFromId } from '@/lib/utils/colorHash'
import { formatDate, formatRelative } from '@/lib/utils/formatDate'
import { cn } from '@/lib/utils/cn'

const supabase = createClient()

type Tab = 'posts' | 'events' | 'buddies'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'posts',   label: 'Liked Posts',   icon: Heart       },
  { id: 'events',  label: 'My Events',     icon: CalendarDays },
  { id: 'buddies', label: 'My Buddies',    icon: Users       },
]

function getInitials(fullName: string | null, username: string | null) {
  if (fullName) {
    const parts = fullName.trim().split(/\s+/).filter(Boolean)
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?'
  }
  return username?.[0]?.toUpperCase() ?? '?'
}

function EmptyPlaceholder({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <Icon className="h-6 w-6 text-gray-400" />
      </div>
      <p className="mt-4 text-sm font-medium text-gray-600">{text}</p>
    </div>
  )
}

export default function FavoritesPage() {
  const { user } = useUser()
  const [tab, setTab] = useState<Tab>('posts')

  // Liked posts
  const { data: likedPosts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ['liked-posts', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      const { data } = await supabase
        .from('post_likes')
        .select('post_id, posts(id, content, likes_count, comments_count, created_at, author:profiles(id, username, full_name, avatar_url, year_group))')
        .eq('user_id', user.id)
        .order('post_id')
      return (data ?? []).map((d) => d.posts).filter(Boolean) as Array<{
        id: string
        content: string
        likes_count: number
        comments_count: number
        created_at: string
        author: { id: string; username: string; full_name: string | null; avatar_url: string | null; year_group: string | null } | null
      }>
    },
    enabled: !!user?.id,
  })

  // Registered events
  const { data: myEvents = [], isLoading: loadingEvents } = useQuery({
    queryKey: ['my-events', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      const { data } = await supabase
        .from('event_registrations')
        .select('event_id, events(id, title, description, event_date, event_time, location, category)')
        .eq('user_id', user.id)
      return (data ?? []).map((d) => d.events).filter(Boolean) as Array<{
        id: string
        title: string
        description: string | null
        event_date: string
        event_time: string | null
        location: string | null
        category: string | null
      }>
    },
    enabled: !!user?.id,
  })

  // Accepted buddy connections
  const { data: buddies = [], isLoading: loadingBuddies } = useQuery({
    queryKey: ['my-buddies', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      const { data } = await supabase
        .from('buddy_connections')
        .select('id, requester_id, receiver_id, requester:profiles!buddy_connections_requester_id_fkey(id, username, full_name, avatar_url, year_group, bio), receiver:profiles!buddy_connections_receiver_id_fkey(id, username, full_name, avatar_url, year_group, bio)')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
      return (data ?? []).map((c) => {
        const peer = c.requester_id === user.id ? c.receiver : c.requester
        return peer
      }).filter(Boolean) as Array<{
        id: string
        username: string
        full_name: string | null
        avatar_url: string | null
        year_group: string | null
        bio: string | null
      }>
    },
    enabled: !!user?.id,
  })

  const isLoading = (tab === 'posts' && loadingPosts) || (tab === 'events' && loadingEvents) || (tab === 'buddies' && loadingBuddies)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Favorites</h1>
        <p className="mt-1 text-sm text-gray-500">
          Your liked posts, upcoming events, and study buddies — all in one place.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl border border-gray-100 bg-white p-1 shadow-sm">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
              tab === id
                ? 'bg-[#9B5941] text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-[#9B5941]" />
        </div>
      )}

      {/* Liked Posts */}
      {!isLoading && tab === 'posts' && (
        likedPosts.length === 0 ? (
          <EmptyPlaceholder icon={Heart} text="You haven't liked any posts yet" />
        ) : (
          <div className="space-y-3">
            {likedPosts.map((post) => {
              const initials = getInitials(post.author?.full_name ?? null, post.author?.username ?? null)
              const color = colorFromId(post.author?.id ?? 'unknown')
              return (
                <article key={post.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={post.author?.avatar_url ?? undefined}
                      fallback={initials}
                      className={cn('shrink-0 text-white', !post.author?.avatar_url && color)}
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {post.author?.full_name ?? post.author?.username ?? 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-400">{formatRelative(post.created_at)}</p>
                    </div>
                    {post.author?.year_group && (
                      <Badge className="ml-auto bg-[#F5EDE8] text-[#9B5941]">{post.author.year_group}</Badge>
                    )}
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                    {post.content}
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5 text-rose-400" fill="currentColor" />
                      {post.likes_count}
                    </span>
                  </div>
                </article>
              )
            })}
          </div>
        )
      )}

      {/* My Events */}
      {!isLoading && tab === 'events' && (
        myEvents.length === 0 ? (
          <EmptyPlaceholder icon={CalendarDays} text="You haven't registered for any events yet" />
        ) : (
          <div className="space-y-3">
            {myEvents
              .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
              .map((event) => {
              const isPast = new Date(event.event_date) < new Date()
              return (
                <div key={event.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      'flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl text-center',
                      isPast ? 'bg-gray-100' : 'bg-[#F5EDE8]'
                    )}>
                      <p className={cn('text-xs font-semibold uppercase', isPast ? 'text-gray-400' : 'text-[#9B5941]')}>
                        {new Date(event.event_date).toLocaleString('default', { month: 'short' })}
                      </p>
                      <p className={cn('text-xl font-bold leading-none', isPast ? 'text-gray-400' : 'text-[#9B5941]')}>
                        {new Date(event.event_date).getDate()}
                      </p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{event.title}</h3>
                        {isPast && <Badge className="bg-gray-100 text-gray-400">Past</Badge>}
                        {event.category && !isPast && (
                          <Badge className="bg-[#F5EDE8] text-[#9B5941]">{event.category}</Badge>
                        )}
                      </div>
                      {event.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-gray-500">{event.description}</p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-400">
                        {event.event_time && <span>{event.event_time}</span>}
                        {event.location && <span>📍 {event.location}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}

      {/* My Buddies */}
      {!isLoading && tab === 'buddies' && (
        buddies.length === 0 ? (
          <EmptyPlaceholder icon={Users} text="No study buddies yet — head to Study Buddy to connect" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {buddies.map((buddy) => {
              const initials = getInitials(buddy.full_name, buddy.username)
              const color = colorFromId(buddy.id)
              return (
                <div key={buddy.id} className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={buddy.avatar_url ?? undefined}
                      fallback={initials}
                      className={cn('h-11 w-11 shrink-0 text-white', !buddy.avatar_url && color)}
                    />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900">{buddy.full_name ?? buddy.username}</p>
                      <p className="truncate text-xs text-gray-500">@{buddy.username}</p>
                    </div>
                  </div>
                  {buddy.year_group && (
                    <Badge className="w-fit bg-[#F5EDE8] text-[#9B5941]">{buddy.year_group}</Badge>
                  )}
                  {buddy.bio && (
                    <p className="line-clamp-2 text-xs leading-relaxed text-gray-500">{buddy.bio}</p>
                  )}
                </div>
              )
            })}
          </div>
        )
      )}
    </div>
  )
}
