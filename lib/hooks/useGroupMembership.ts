'use client'

import { useState } from 'react'

export function useGroupMembership(
  groupId: string,
  initialIsMember: boolean,
  initialCount: number
) {
  const [isMember, setIsMember] = useState(initialIsMember)
  const [memberCount, setMemberCount] = useState(initialCount)
  const [isLoading, setIsLoading] = useState(false)

  async function join(): Promise<boolean> {
    if (isMember || isLoading) return false
    setIsMember(true)
    setMemberCount((c) => c + 1)
    setIsLoading(true)
    try {
      const res = await fetch(`/api/groups/${groupId}/members`, { method: 'POST' })
      if (!res.ok) {
        setIsMember(false)
        setMemberCount((c) => c - 1)
        return false
      }
      return true
    } finally {
      setIsLoading(false)
    }
  }

  async function leave(): Promise<boolean> {
    if (!isMember || isLoading) return false
    setIsMember(false)
    setMemberCount((c) => c - 1)
    setIsLoading(true)
    try {
      const res = await fetch(`/api/groups/${groupId}/members`, { method: 'DELETE' })
      if (!res.ok) {
        setIsMember(true)
        setMemberCount((c) => c + 1)
        return false
      }
      return true
    } finally {
      setIsLoading(false)
    }
  }

  return { isMember, memberCount, isLoading, join, leave }
}
