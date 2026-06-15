'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users } from 'lucide-react'
import { Button } from '@/components/ui'
import { colorFromId } from '@/lib/utils/colorHash'
import { useGroupMembership } from '@/lib/hooks/useGroupMembership'
import { cn } from '@/lib/utils/cn'
import CreateGroupModal from './CreateGroupModal'
import type { GroupWithRole } from '@/app/api/groups/route'

// -----------------------------------------------------------------------
// GroupCard
// -----------------------------------------------------------------------
function GroupCard({
  group,
  onLeave,
}: {
  group: GroupWithRole
  onLeave: (id: string) => void
}) {
  const router = useRouter()
  const { isLoading, leave } = useGroupMembership(group.id, true, group.member_count)
  const [confirming, setConfirming] = useState(false)

  async function handleLeave() {
    const success = await leave()
    if (success) onLeave(group.id)
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white',
            colorFromId(group.id)
          )}
        >
          <Users className="h-6 w-6" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-gray-900">{group.name}</p>
            {group.type && (
              <span className="rounded-full bg-[#F5EDE8] px-2 py-0.5 text-xs font-medium text-[#9B5941]">
                {group.type}
              </span>
            )}
            {group.myRole === 'admin' && (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600">
                Admin
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-gray-400">{group.member_count} members</p>
          {group.description && (
            <p className="mt-2 line-clamp-2 text-sm text-gray-500">{group.description}</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button
          size="sm"
          className="flex-1 bg-[#9B5941] text-white hover:bg-[#7D4532]"
          onClick={() => router.push(`/groups/${group.id}`)}
        >
          Open Group
        </Button>

        {confirming ? (
          <>
            <Button size="sm" variant="outline" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isLoading}
              className="border-red-200 text-red-500 hover:bg-red-50"
              onClick={handleLeave}
            >
              Confirm Leave
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setConfirming(true)}
            className="text-gray-500 hover:border-red-200 hover:text-red-500"
          >
            Leave
          </Button>
        )}
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------
// GroupsClient
// -----------------------------------------------------------------------
export default function GroupsClient({ initialGroups }: { initialGroups: GroupWithRole[] }) {
  const [groups, setGroups] = useState(initialGroups)
  const [isModalOpen, setIsModalOpen] = useState(false)

  function handleCreated(group: GroupWithRole) {
    setGroups((prev) => [group, ...prev])
    setIsModalOpen(false)
  }

  function handleLeft(id: string) {
    setGroups((prev) => prev.filter((g) => g.id !== id))
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Groups</h1>
          <p className="mt-0.5 text-sm text-gray-500">Groups you've joined or created</p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#9B5941] text-white hover:bg-[#7D4532]"
        >
          + Create Group
        </Button>
      </div>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white py-16 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F5EDE8]">
            <Users className="h-8 w-8 text-[#9B5941]" />
          </div>
          <p className="font-semibold text-gray-700">No groups yet</p>
          <p className="text-sm text-gray-400">
            Create a group or join one from Interest Groups.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} onLeave={handleLeft} />
          ))}
        </div>
      )}

      {isModalOpen && (
        <CreateGroupModal onClose={() => setIsModalOpen(false)} onSuccess={handleCreated} />
      )}
    </>
  )
}
