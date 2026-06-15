'use client'

import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui'
import { colorFromId } from '@/lib/utils/colorHash'
import { useGroupMembership } from '@/lib/hooks/useGroupMembership'
import { cn } from '@/lib/utils/cn'
import type { Group } from '@/types/database.types'

// -----------------------------------------------------------------------
// InterestGroupCard
// -----------------------------------------------------------------------
function InterestGroupCard({
  group,
  initialIsMember,
}: {
  group: Group
  initialIsMember: boolean
}) {
  const { isMember, memberCount, isLoading, join, leave } = useGroupMembership(
    group.id,
    initialIsMember,
    group.member_count
  )

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white',
            colorFromId(group.id)
          )}
        >
          <Sparkles className="h-6 w-6" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900">{group.name}</p>
          <p className="text-xs text-gray-400">{memberCount} members</p>
        </div>

        <Button
          size="sm"
          variant={isMember ? 'outline' : undefined}
          disabled={isLoading}
          onClick={isMember ? leave : join}
          className={cn(
            'shrink-0 transition-colors',
            isMember
              ? 'text-gray-600 hover:border-red-200 hover:text-red-500'
              : 'bg-[#9B5941] text-white hover:bg-[#7D4532]'
          )}
        >
          {isMember ? 'Joined' : 'Join'}
        </Button>
      </div>

      {group.description && (
        <p className="mt-3 line-clamp-2 text-sm text-gray-500">{group.description}</p>
      )}
    </div>
  )
}

// -----------------------------------------------------------------------
// InterestGroupsClient
// -----------------------------------------------------------------------
export default function InterestGroupsClient({
  groups,
  memberGroupIds,
}: {
  groups: Group[]
  memberGroupIds: string[]
}) {
  const memberSet = new Set(memberGroupIds)

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Interest Groups</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Join groups that match your interests and hobbies
        </p>
      </div>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white py-16 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F5EDE8] text-3xl">
            ✨
          </div>
          <p className="font-semibold text-gray-700">No interest groups yet</p>
          <p className="text-sm text-gray-400">Check back soon — new groups are being added.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {groups.map((group) => (
            <InterestGroupCard
              key={group.id}
              group={group}
              initialIsMember={memberSet.has(group.id)}
            />
          ))}
        </div>
      )}
    </>
  )
}
