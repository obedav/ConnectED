'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { ChevronLeft, Info, Mic, Send, Smile } from 'lucide-react'
import { Avatar } from '@/components/ui'
import { colorFromId } from '@/lib/utils/colorHash'
import { cn } from '@/lib/utils/cn'
import { useMessages } from '@/lib/hooks/useMessages'
import { showToast } from '@/lib/stores/toastStore'
import type { Profile } from '@/types/database.types'
import type { MessageWithSender } from '@/types/chat'

interface ChatWindowProps {
  partner: Profile | null
  currentUserId: string
  onBack?: () => void
  onContactClick?: () => void
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

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDateSeparator(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function groupMessagesByDate(
  messages: MessageWithSender[]
): { dateKey: string; label: string; messages: MessageWithSender[] }[] {
  const groups: { dateKey: string; label: string; messages: MessageWithSender[] }[] = []

  for (const msg of messages) {
    const dateKey = new Date(msg.created_at).toDateString()
    const last = groups[groups.length - 1]
    if (last && last.dateKey === dateKey) {
      last.messages.push(msg)
    } else {
      groups.push({ dateKey, label: formatDateSeparator(msg.created_at), messages: [msg] })
    }
  }

  return groups
}

export function ChatWindow({ partner, currentUserId, onBack, onContactClick }: ChatWindowProps) {
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { messages, sendMessage, isLoading } = useMessages(
    partner?.id ?? null,
    currentUserId
  )

  const grouped = useMemo(() => groupMessagesByDate(messages), [messages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    const trimmed = draft.trim()
    if (!trimmed || isSending || !partner) return

    setDraft('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    setIsSending(true)
    try {
      await sendMessage(trimmed)
    } catch {
      showToast('Failed to send message', 'error')
    } finally {
      setIsSending(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  function autoResize(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setDraft(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${e.target.scrollHeight}px`
  }

  if (!partner) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 bg-gray-50">
        <div className="h-16 w-16 rounded-full bg-[#F5EDE8] flex items-center justify-center">
          <Send className="h-7 w-7 text-[#9B5941]" />
        </div>
        <p className="text-sm font-medium text-gray-700">Your Messages</p>
        <p className="text-xs text-gray-400">Select a conversation to start chatting</p>
      </div>
    )
  }

  const initials = getInitials(partner.full_name, partner.username)
  const displayName = partner.full_name ?? partner.username
  const colorClass = colorFromId(partner.id)

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-gray-100 bg-white px-4 py-3">
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Back"
            className="mr-1 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 lg:hidden"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        <Avatar fallback={initials} className={cn('shrink-0 text-white', colorClass)} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900">{displayName}</p>
          <p className="flex items-center gap-1 text-xs text-emerald-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Online
          </p>
        </div>
        <button
          onClick={onContactClick}
          aria-label="Contact info"
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#9B5941]"
        >
          <Info className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className={cn('flex', i % 2 === 0 ? 'justify-start' : 'justify-end')}
              >
                <div
                  className={cn(
                    'h-8 animate-pulse rounded-2xl bg-gray-200',
                    i % 2 === 0 ? 'w-48' : 'w-36'
                  )}
                />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-gray-400">
            No messages yet. Say hello!
          </p>
        ) : (
          grouped.map((group) => (
            <div key={group.dateKey}>
              {/* Date separator */}
              <div className="my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-100" />
                <span className="text-xs text-gray-400">{group.label}</span>
                <div className="h-px flex-1 bg-gray-100" />
              </div>

              <div className="flex flex-col gap-1.5">
                {group.messages.map((msg) => {
                  const isMine = msg.sender_id === currentUserId
                  return (
                    <div
                      key={msg.id}
                      className={cn('flex flex-col', isMine ? 'items-end' : 'items-start')}
                    >
                      <div
                        className={cn(
                          'max-w-[70%] rounded-2xl px-4 py-2 text-sm leading-relaxed',
                          isMine
                            ? 'rounded-br-sm bg-[#9B5941] text-white'
                            : 'rounded-bl-sm bg-gray-100 text-gray-800'
                        )}
                      >
                        {msg.content}
                      </div>
                      <span className="mt-0.5 px-1 text-[10px] text-gray-400">
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="shrink-0 border-t border-gray-100 bg-white px-4 py-3">
        <div className="flex items-end gap-2">
          <button
            aria-label="Emoji"
            className="mb-1 shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#9B5941]"
          >
            <Smile className="h-5 w-5" />
          </button>

          <div className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2">
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={autoResize}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
              rows={1}
              className="w-full resize-none bg-transparent text-sm leading-relaxed text-gray-800 placeholder:text-gray-400 focus:outline-none"
            />
          </div>

          {draft.trim() ? (
            <button
              onClick={() => void handleSend()}
              disabled={isSending}
              aria-label="Send message"
              className="mb-1 shrink-0 rounded-lg bg-[#9B5941] p-2 text-white transition-colors hover:bg-[#7D4532] disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          ) : (
            <button
              aria-label="Voice message"
              className="mb-1 shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#9B5941]"
            >
              <Mic className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
