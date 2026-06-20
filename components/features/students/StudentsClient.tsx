'use client'

import { useState, useMemo } from 'react'
import { Search, Trophy, FileText, Users, Star } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils/cn'
import { colorFromId } from '@/lib/utils/colorHash'

export interface ProfileWithStats {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  year_group: string | null
  house: string | null
  bio: string | null
  post_count: number
  note_count: number
  connection_count: number
  score: number
}

const YEAR_GROUPS = ['Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11', 'Year 12']

const RANK_STYLES = [
  { bg: 'bg-amber-50 border-amber-200', badge: 'bg-amber-400 text-white', label: '🥇 1st' },
  { bg: 'bg-gray-50 border-gray-200',   badge: 'bg-gray-400 text-white',  label: '🥈 2nd' },
  { bg: 'bg-orange-50 border-orange-200', badge: 'bg-orange-400 text-white', label: '🥉 3rd' },
]

function getInitials(fullName: string | null, username: string) {
  if (fullName) {
    const parts = fullName.trim().split(/\s+/).filter(Boolean)
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?'
  }
  return username[0]?.toUpperCase() ?? '?'
}

function PodiumCard({ profile, rank }: { profile: ProfileWithStats; rank: number }) {
  const style = RANK_STYLES[rank]!
  const initials = getInitials(profile.full_name, profile.username)
  const color = colorFromId(profile.id)

  return (
    <div className={cn('flex flex-col items-center gap-3 rounded-2xl border p-5', style.bg)}>
      <div className="relative">
        <Avatar
          src={profile.avatar_url ?? undefined}
          fallback={initials}
          className={cn('h-16 w-16 text-xl text-white ring-2 ring-white', !profile.avatar_url && color)}
        />
        <span className={cn('absolute -bottom-1 -right-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold', style.badge)}>
          {style.label}
        </span>
      </div>

      <div className="text-center">
        <p className="font-semibold text-gray-900">{profile.full_name ?? profile.username}</p>
        <p className="text-xs text-gray-500">@{profile.username}</p>
        {profile.year_group && (
          <span className="mt-1 inline-block rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-medium text-gray-600">
            {profile.year_group}
          </span>
        )}
      </div>

      <div className="flex gap-4 text-center text-xs text-gray-600">
        <div>
          <p className="font-bold text-gray-900">{profile.post_count}</p>
          <p>Posts</p>
        </div>
        <div>
          <p className="font-bold text-gray-900">{profile.note_count}</p>
          <p>Notes</p>
        </div>
        <div>
          <p className="font-bold text-gray-900">{profile.connection_count}</p>
          <p>Buddies</p>
        </div>
      </div>

      <div className="flex items-center gap-1 rounded-full bg-white/80 px-3 py-1">
        <Star className="h-3 w-3 text-amber-400" fill="currentColor" />
        <span className="text-xs font-bold text-gray-800">{profile.score} pts</span>
      </div>
    </div>
  )
}

function StudentCard({ profile }: { profile: ProfileWithStats }) {
  const initials = getInitials(profile.full_name, profile.username)
  const color = colorFromId(profile.id)

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-3">
        <Avatar
          src={profile.avatar_url ?? undefined}
          fallback={initials}
          className={cn('h-11 w-11 shrink-0 text-white', !profile.avatar_url && color)}
        />
        <div className="min-w-0">
          <p className="truncate font-medium text-gray-900">
            {profile.full_name ?? profile.username}
          </p>
          <p className="truncate text-xs text-gray-500">@{profile.username}</p>
        </div>
      </div>

      {(profile.year_group || profile.house) && (
        <div className="flex flex-wrap gap-1.5">
          {profile.year_group && (
            <Badge className="bg-[#F5EDE8] text-[#9B5941]">{profile.year_group}</Badge>
          )}
          {profile.house && (
            <Badge className="bg-gray-100 text-gray-600">{profile.house}</Badge>
          )}
        </div>
      )}

      {profile.bio && (
        <p className="line-clamp-2 text-xs leading-relaxed text-gray-500">{profile.bio}</p>
      )}

      <div className="flex gap-3 border-t border-gray-50 pt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Trophy className="h-3.5 w-3.5 text-[#9B5941]" />
          {profile.post_count} posts
        </span>
        <span className="flex items-center gap-1">
          <FileText className="h-3.5 w-3.5 text-[#9B5941]" />
          {profile.note_count} notes
        </span>
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5 text-[#9B5941]" />
          {profile.connection_count} buddies
        </span>
      </div>
    </div>
  )
}

export function StudentsClient({ profiles }: { profiles: ProfileWithStats[] }) {
  const [search, setSearch] = useState('')
  const [yearFilter, setYearFilter] = useState<string | null>(null)

  const topThree = useMemo(
    () => [...profiles].sort((a, b) => b.score - a.score).slice(0, 3),
    [profiles]
  )

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return profiles
      .filter((p) => {
        const matchesSearch =
          !q ||
          p.username.toLowerCase().includes(q) ||
          (p.full_name?.toLowerCase().includes(q) ?? false)
        const matchesYear = !yearFilter || p.year_group === yearFilter
        return matchesSearch && matchesYear
      })
      .sort((a, b) => b.score - a.score)
  }, [profiles, search, yearFilter])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Students League</h1>
        <p className="mt-1 text-sm text-gray-500">
          Top contributors earn points for posts, notes, and study connections.
        </p>
      </div>

      {/* Top 3 podium */}
      {topThree.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
            Top Contributors
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {topThree.map((p, i) => (
              <PodiumCard key={p.id} profile={p} rank={i} />
            ))}
          </div>
        </section>
      )}

      {/* Browse all students */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Browse Students
        </h2>

        {/* Search + filter */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or username…"
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setYearFilter(null)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                yearFilter === null
                  ? 'border-[#9B5941] bg-[#9B5941] text-white'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              )}
            >
              All years
            </button>
            {YEAR_GROUPS.map((y) => (
              <button
                key={y}
                onClick={() => setYearFilter(yearFilter === y ? null : y)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                  yearFilter === y
                    ? 'border-[#9B5941] bg-[#9B5941] text-white'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                )}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center shadow-sm">
            <p className="text-4xl">🔍</p>
            <p className="mt-3 text-sm font-medium text-gray-600">No students found</p>
            <p className="mt-1 text-xs text-gray-400">Try a different name or year group</p>
          </div>
        ) : (
          <>
            <p className="mb-3 text-xs text-gray-400">{filtered.length} student{filtered.length !== 1 ? 's' : ''}</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => (
                <StudentCard key={p.id} profile={p} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  )
}
