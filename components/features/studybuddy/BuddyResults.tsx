'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useStudyBuddyMatch } from '@/lib/hooks/useStudyBuddyMatch'
import { Avatar } from '@/components/ui'
import { Button } from '@/components/ui'
import { colorFromId } from '@/lib/utils/colorHash'
import { cn } from '@/lib/utils/cn'
import type { StudyBuddyProfile } from '@/types/database.types'
import type { ScoredMatch } from '@/lib/hooks/useStudyBuddyMatch'

const supabase = createClient()

interface BuddyResultsProps {
  myProfile: StudyBuddyProfile
  currentUserId: string
}

function getInitials(fullName: string | null | undefined, username: string): string {
  if (fullName) {
    const words = fullName.trim().split(/\s+/).filter(Boolean)
    const a = words[0]?.[0]?.toUpperCase() ?? ''
    const b = words[1]?.[0]?.toUpperCase() ?? ''
    return (a + b) || '?'
  }
  return username[0]?.toUpperCase() ?? '?'
}

function ScoreBadge({ pct }: { pct: number }) {
  const colorClass =
    pct >= 85
      ? 'bg-emerald-50 text-emerald-600'
      : pct >= 60
      ? 'bg-amber-50 text-amber-600'
      : 'bg-gray-100 text-gray-500'

  return (
    <div className={cn('flex shrink-0 flex-col items-center rounded-xl px-3 py-2', colorClass)}>
      <span className="text-2xl font-bold tabular-nums leading-tight">{pct}%</span>
      <span className="text-[9px] font-semibold uppercase tracking-wide">match</span>
    </div>
  )
}

function BuddyCard({
  match,
  isSent,
  onConnect,
}: {
  match: ScoredMatch
  isSent: boolean
  onConnect: () => void
}) {
  const profile = match.profile
  if (!profile || !match.user_id) return null

  const initials = getInitials(profile.full_name, profile.username)
  const displayName = profile.full_name ?? profile.username
  const colorClass = colorFromId(profile.id)

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      {/* Header row */}
      <div className="flex items-start gap-3">
        <Avatar fallback={initials} className={cn('shrink-0 text-white', colorClass)} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900">{displayName}</p>
          {match.academic_level && (
            <p className="text-xs text-gray-400">{match.academic_level}</p>
          )}
        </div>
        <ScoreBadge pct={match.scorePct} />
      </div>

      {/* Subjects studying */}
      {(match.subjects_studying?.length ?? 0) > 0 && (
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            Studying
          </p>
          <div className="flex flex-wrap gap-1">
            {match.subjects_studying?.map((s) => (
              <span
                key={s}
                className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] text-gray-600"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Subjects needing help */}
      {(match.subjects_needing_help?.length ?? 0) > 0 && (
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            Needs help with
          </p>
          <div className="flex flex-wrap gap-1">
            {match.subjects_needing_help?.map((s) => (
              <span
                key={s}
                className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] text-amber-700"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Study styles */}
      {(match.study_styles?.length ?? 0) > 0 && (
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            Study style
          </p>
          <div className="flex flex-wrap gap-1">
            {match.study_styles?.map((s) => (
              <span
                key={s}
                className="rounded-full border border-[#3B1FDB]/20 bg-[#EDE9FF] px-2.5 py-0.5 text-[11px] text-[#3B1FDB]"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Connect button */}
      <Button
        size="sm"
        onClick={onConnect}
        disabled={isSent}
        className={cn(
          'mt-auto w-full',
          isSent
            ? 'cursor-default bg-gray-100 text-gray-400 hover:bg-gray-100'
            : 'bg-[#3B1FDB] text-white hover:bg-[#3018c0]'
        )}
      >
        {isSent ? 'Request sent' : 'Connect'}
      </Button>
    </div>
  )
}

export function BuddyResults({ myProfile, currentUserId }: BuddyResultsProps) {
  const { matches, isLoading } = useStudyBuddyMatch(myProfile)
  const [sentSet, setSentSet] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchExisting = async () => {
      const { data } = await supabase
        .from('buddy_connections')
        .select('receiver_id')
        .eq('requester_id', currentUserId)

      const ids = (data ?? [])
        .map((r) => r.receiver_id)
        .filter((id): id is string => !!id)

      setSentSet(new Set(ids))
    }
    void fetchExisting()
  }, [currentUserId])

  async function handleConnect(receiverUserId: string) {
    setSentSet((prev) => new Set([...prev, receiverUserId]))

    const { error } = await supabase
      .from('buddy_connections')
      .insert({ requester_id: currentUserId, receiver_id: receiverUserId, status: 'pending' })

    if (error) {
      setSentSet((prev) => {
        const next = new Set(prev)
        next.delete(receiverUserId)
        return next
      })
    }
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 shrink-0 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-1.5 pt-0.5">
                <div className="h-3.5 w-28 rounded-md bg-gray-200" />
                <div className="h-3 w-16 rounded-md bg-gray-100" />
              </div>
              <div className="h-14 w-14 rounded-xl bg-gray-100" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-3 w-full rounded-md bg-gray-100" />
              <div className="h-3 w-3/4 rounded-md bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white py-16 text-center shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EDE9FF] text-3xl">
          🔍
        </div>
        <p className="font-semibold text-gray-700">No matches found yet</p>
        <p className="text-sm text-gray-400">
          Check back once more students have set up their profiles
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {matches.map((match) => {
        const receiverUserId = match.user_id
        if (!receiverUserId || !match.profile) return null

        return (
          <BuddyCard
            key={match.id}
            match={match}
            isSent={sentSet.has(receiverUserId)}
            onConnect={() => void handleConnect(receiverUserId)}
          />
        )
      })}
    </div>
  )
}
