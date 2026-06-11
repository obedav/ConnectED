'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { StudyBuddyProfileWithUser } from '@/app/api/study-buddy/route'
import type { StudyBuddyProfile } from '@/types/database.types'

export type { StudyBuddyProfileWithUser }

export type ScoredMatch = StudyBuddyProfileWithUser & {
  score: number
  scorePct: number
}

function intersect(
  a: string[] | null | undefined,
  b: string[] | null | undefined
): number {
  if (!a?.length || !b?.length) return 0
  const setB = new Set(b.map((s) => s.toLowerCase()))
  return a.filter((s) => setB.has(s.toLowerCase())).length
}

function computeScore(me: StudyBuddyProfile, them: StudyBuddyProfileWithUser): number {
  let score = 0
  if (me.academic_level && them.academic_level === me.academic_level) score += 25
  score += 15 * intersect(me.subjects_studying, them.subjects_studying)
  score += 20 * intersect(me.subjects_needing_help, them.subjects_studying)
  score += 10 * intersect(me.study_styles, them.study_styles)
  return score
}

function computeMaxScore(me: StudyBuddyProfile): number {
  return (
    25 +
    15 * (me.subjects_studying?.length ?? 0) +
    20 * (me.subjects_needing_help?.length ?? 0) +
    10 * (me.study_styles?.length ?? 0)
  )
}

export function useStudyBuddyMatch(myProfile: StudyBuddyProfile): {
  matches: ScoredMatch[]
  isLoading: boolean
} {
  const { data: profiles = [], isLoading } = useQuery<StudyBuddyProfileWithUser[]>({
    queryKey: ['study-buddy-profiles'],
    queryFn: async (): Promise<StudyBuddyProfileWithUser[]> => {
      const res = await fetch('/api/study-buddy')
      if (!res.ok) throw new Error('Failed to fetch study buddy profiles')
      return res.json() as Promise<StudyBuddyProfileWithUser[]>
    },
  })

  const matches = useMemo<ScoredMatch[]>(() => {
    const max = computeMaxScore(myProfile)
    return profiles
      .map((p) => {
        const score = computeScore(myProfile, p)
        const scorePct = max > 0 ? Math.min(100, Math.round((score / max) * 100)) : 0
        return { ...p, score, scorePct }
      })
      .sort((a, b) => b.score - a.score)
  }, [profiles, myProfile])

  return { matches, isLoading }
}
