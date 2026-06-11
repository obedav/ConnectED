'use client'

import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { MessageWithSender } from '@/types/chat'

const supabase = createClient()

export function useMessages(partnerId: string | null, currentUserId: string | undefined) {
  const queryClient = useQueryClient()

  const { data: messages = [], isLoading } = useQuery<MessageWithSender[]>({
    queryKey: ['messages', partnerId],
    queryFn: async (): Promise<MessageWithSender[]> => {
      if (!partnerId) return []
      const res = await fetch(`/api/messages?partnerId=${partnerId}`)
      if (!res.ok) throw new Error('Failed to fetch messages')
      return res.json() as Promise<MessageWithSender[]>
    },
    enabled: !!partnerId && !!currentUserId,
  })

  useEffect(() => {
    if (!partnerId || !currentUserId) return

    const roomId = [currentUserId, partnerId].sort().join('-')
    const channel = supabase
      .channel(`messages:room=${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${currentUserId}`,
        },
        (payload) => {
          const newMsg = payload.new as MessageWithSender
          if (newMsg.sender_id !== partnerId) return
          queryClient.setQueryData<MessageWithSender[]>(
            ['messages', partnerId],
            (old) => [...(old ?? []), { ...newMsg, sender: null }]
          )
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [partnerId, currentUserId, queryClient])

  async function sendMessage(content: string): Promise<void> {
    if (!partnerId || !currentUserId) return

    const tempId = crypto.randomUUID()
    const tempMsg: MessageWithSender = {
      id: tempId,
      sender_id: currentUserId,
      receiver_id: partnerId,
      content,
      read: false,
      created_at: new Date().toISOString(),
      sender: null,
    }

    queryClient.setQueryData<MessageWithSender[]>(
      ['messages', partnerId],
      (old) => [...(old ?? []), tempMsg]
    )

    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partnerId, content }),
    })

    if (!res.ok) {
      queryClient.setQueryData<MessageWithSender[]>(
        ['messages', partnerId],
        (old) => (old ?? []).filter((m) => m.id !== tempId)
      )
      throw new Error('Failed to send message')
    }

    const json = (await res.json()) as { message?: MessageWithSender }
    const realMsg = json.message
    if (realMsg) {
      queryClient.setQueryData<MessageWithSender[]>(
        ['messages', partnerId],
        (old) => (old ?? []).map((m) => (m.id === tempId ? realMsg : m))
      )
    }
  }

  return { messages, sendMessage, isLoading }
}
