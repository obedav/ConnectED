'use client'

import { Avatar } from '@/components/ui'
import { colorFromId } from '@/lib/utils/colorHash'
import { formatRelative } from '@/lib/utils/formatDate'
import { cn } from '@/lib/utils/cn'
import type { Conversation } from '@/types/chat'

interface ConversationListProps {
  conversations: Conversation[]
  activePartnerId: string | null
  onSelect: (partnerId: string) => void
  isLoading: boolean
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

export function ConversationList({
  conversations,
  activePartnerId,
  onSelect,
  isLoading,
}: ConversationListProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-gray-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">Messages</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col gap-0.5 p-2">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex animate-pulse items-center gap-3 rounded-xl p-3">
                <div className="h-9 w-9 shrink-0 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-24 rounded-md bg-gray-200" />
                  <div className="h-3 w-36 rounded-md bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <p className="p-6 text-center text-sm text-gray-400">No conversations yet</p>
        ) : (
          <div className="flex flex-col gap-0.5 p-2">
            {conversations.map(({ partner, lastMessage, unreadCount }) => {
              const isActive = partner.id === activePartnerId
              const initials = getInitials(partner.full_name, partner.username)
              const colorClass = colorFromId(partner.id)
              const displayName = partner.full_name ?? partner.username
              const preview =
                lastMessage.content.length > 35
                  ? lastMessage.content.slice(0, 35) + '…'
                  : lastMessage.content

              return (
                <button
                  key={partner.id}
                  onClick={() => onSelect(partner.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors',
                    isActive ? 'bg-[#EDE9FF]' : 'hover:bg-gray-50'
                  )}
                >
                  <div className="relative shrink-0">
                    <Avatar fallback={initials} className={cn('text-white', colorClass)} />
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          'truncate text-sm',
                          isActive
                            ? 'font-semibold text-[#3B1FDB]'
                            : 'font-medium text-gray-900'
                        )}
                      >
                        {displayName}
                      </span>
                      <span className="shrink-0 text-[10px] text-gray-400">
                        {formatRelative(lastMessage.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs text-gray-400">{preview}</span>
                      {unreadCount > 0 && (
                        <span className="shrink-0 rounded-full bg-[#3B1FDB] px-1.5 py-0.5 text-[10px] font-medium text-white">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
