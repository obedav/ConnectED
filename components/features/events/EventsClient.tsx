'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
import { cn } from '@/lib/utils/cn'
import type { Event } from '@/types/database.types'

const supabase = createClient()

const CATEGORY_COLORS: Record<string, string> = {
  Academic: 'bg-blue-50 text-blue-600',
  Sport: 'bg-emerald-50 text-emerald-600',
  Social: 'bg-pink-50 text-pink-600',
  Arts: 'bg-amber-50 text-amber-600',
  Cultural: 'bg-violet-50 text-violet-600',
}

function EventCard({
  event,
  initialIsRegistered,
  currentUserId,
}: {
  event: Event
  initialIsRegistered: boolean
  currentUserId: string
}) {
  const [isRegistered, setIsRegistered] = useState(initialIsRegistered)
  const [isReminded, setIsReminded] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('reminded_events')
      const ids: string[] = stored ? (JSON.parse(stored) as string[]) : []
      setIsReminded(ids.includes(event.id))
    } catch {}
  }, [event.id])

  async function handleRegister() {
    if (isRegistered || isRegistering) return
    setIsRegistering(true)
    const { error } = await supabase
      .from('event_registrations')
      .insert({ event_id: event.id, user_id: currentUserId })
    if (!error) setIsRegistered(true)
    setIsRegistering(false)
  }

  function handleRemind() {
    try {
      const stored = localStorage.getItem('reminded_events')
      const ids: string[] = stored ? (JSON.parse(stored) as string[]) : []
      if (!ids.includes(event.id)) {
        ids.push(event.id)
        localStorage.setItem('reminded_events', JSON.stringify(ids))
      }
      setIsReminded(true)
    } catch {}
  }

  // Use noon to avoid DST / timezone day-shift on date-only strings
  const dateObj = new Date(`${event.event_date}T12:00:00`)
  const day = dateObj.getDate()
  const month = dateObj.toLocaleString('en-GB', { month: 'short' })
  const timeStr = event.event_time ? event.event_time.slice(0, 5) : null
  const categoryColor =
    CATEGORY_COLORS[event.category ?? ''] ?? 'bg-gray-100 text-gray-500'

  return (
    <div className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      {/* Date banner */}
      <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-[#9B5941] py-3 text-white">
        <span className="text-2xl font-bold leading-tight">{day}</span>
        <span className="text-[11px] font-medium uppercase tracking-wide opacity-80">
          {month}
        </span>
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div>
          <div className="flex flex-wrap items-start gap-2">
            <p className="flex-1 font-semibold text-gray-900">{event.title}</p>
            {event.category && (
              <span
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-xs font-medium',
                  categoryColor
                )}
              >
                {event.category}
              </span>
            )}
          </div>
          {(timeStr ?? event.location) && (
            <p className="mt-1 text-xs text-gray-400">
              {[timeStr, event.location].filter(Boolean).join(' · ')}
            </p>
          )}
          {event.description && (
            <p className="mt-1.5 line-clamp-2 text-sm text-gray-500">
              {event.description}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => void handleRegister()}
            disabled={isRegistered || isRegistering}
            className={cn(
              isRegistered
                ? 'cursor-default bg-emerald-50 text-emerald-600 hover:bg-emerald-50'
                : 'bg-[#9B5941] text-white hover:bg-[#7D4532]'
            )}
          >
            {isRegistered ? 'Registered ✓' : isRegistering ? 'Registering…' : 'Register'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRemind}
            disabled={isReminded}
            className={cn(
              isReminded && 'cursor-default border-[#9B5941]/30 text-[#9B5941]'
            )}
          >
            {isReminded ? 'Reminded ✓' : 'Remind me'}
          </Button>
        </div>
      </div>
    </div>
  )
}

interface EventsClientProps {
  events: Event[]
  registeredEventIds: string[]
  currentUserId: string
}

export function EventsClient({
  events,
  registeredEventIds,
  currentUserId,
}: EventsClientProps) {
  const registeredSet = new Set(registeredEventIds)

  return (
    <>
      <PageHeader title="Events" subtitle="Upcoming school events and activities" />

      {events.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white py-16 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F5EDE8] text-3xl">
            📅
          </div>
          <p className="font-semibold text-gray-700">No upcoming events</p>
          <p className="text-sm text-gray-400">Check back soon for new events.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              initialIsRegistered={registeredSet.has(event.id)}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </>
  )
}
