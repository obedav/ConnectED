'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import { ConversationList } from './ConversationList'
import { ChatWindow } from './ChatWindow'
import { ContactPanel } from './ContactPanel'
import { cn } from '@/lib/utils/cn'
import type { Conversation } from '@/types/chat'
import type { Message } from '@/types/database.types'

const supabase = createClient()

type MobilePanel = 'list' | 'chat' | 'contact'

export function ChatsClient() {
  const { user } = useUser()
  const [activePartnerId, setActivePartnerId] = useState<string | null>(null)
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('list')

  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ['conversations', user?.id],
    queryFn: async (): Promise<Conversation[]> => {
      if (!user?.id) return []

      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(500)

      if (error) throw error

      // Group by partner, track last message and unread count
      const convMap = new Map<string, { lastMessage: Message; unreadCount: number }>()

      for (const msg of messages ?? []) {
        const partnerId =
          msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
        if (!partnerId) continue

        if (!convMap.has(partnerId)) {
          convMap.set(partnerId, {
            lastMessage: msg,
            unreadCount: msg.receiver_id === user.id && !msg.read ? 1 : 0,
          })
        } else {
          if (msg.receiver_id === user.id && !msg.read) {
            const entry = convMap.get(partnerId)
            if (entry) entry.unreadCount++
          }
        }
      }

      if (convMap.size === 0) return []

      const partnerIds = Array.from(convMap.keys())
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', partnerIds)

      return (profiles ?? [])
        .map((p) => {
          const entry = convMap.get(p.id)
          if (!entry) return null
          return { partner: p, lastMessage: entry.lastMessage, unreadCount: entry.unreadCount }
        })
        .filter((c): c is Conversation => c !== null)
        .sort(
          (a, b) =>
            new Date(b.lastMessage.created_at).getTime() -
            new Date(a.lastMessage.created_at).getTime()
        )
    },
    enabled: !!user?.id,
  })

  const activePartner = useMemo(
    () => conversations.find((c) => c.partner.id === activePartnerId)?.partner ?? null,
    [conversations, activePartnerId]
  )

  function handleSelectConversation(partnerId: string) {
    setActivePartnerId(partnerId)
    setMobilePanel('chat')
  }

  function handleContactClick() {
    setMobilePanel('contact')
  }

  function handleBackFromChat() {
    setMobilePanel('list')
  }

  function handleBackFromContact() {
    setMobilePanel('chat')
  }

  return (
    <div className="flex h-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      {/* Conversation list — always visible on lg+, conditionally on mobile */}
      <div
        className={cn(
          'w-72 shrink-0 border-r border-gray-100',
          mobilePanel === 'list' ? 'flex flex-col' : 'hidden',
          'lg:flex lg:flex-col'
        )}
      >
        <ConversationList
          conversations={conversations}
          activePartnerId={activePartnerId}
          onSelect={handleSelectConversation}
          isLoading={conversationsLoading}
        />
      </div>

      {/* Chat window — always visible on lg+, conditionally on mobile */}
      <div
        className={cn(
          'min-w-0 flex-1',
          mobilePanel === 'chat' ? 'flex flex-col' : 'hidden',
          'lg:flex lg:flex-col'
        )}
      >
        {user && (
          <ChatWindow
            partner={activePartner}
            currentUserId={user.id}
            onBack={handleBackFromChat}
            onContactClick={handleContactClick}
          />
        )}
      </div>

      {/* Contact panel — always visible on lg+, conditionally on mobile */}
      <div
        className={cn(
          'w-56 shrink-0 border-l border-gray-100',
          mobilePanel === 'contact' ? 'flex flex-col' : 'hidden',
          'lg:flex lg:flex-col'
        )}
      >
        <ContactPanel partner={activePartner} onBack={handleBackFromContact} />
      </div>
    </div>
  )
}
