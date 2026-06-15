import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { EventsClient } from '@/components/features/events/EventsClient'

export const metadata: Metadata = {
  title: 'Events',
  description: 'Browse and register for upcoming school events and activities.',
}

export default async function EventsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const [{ data: events }, { data: registrations }] = await Promise.all([
    supabase.from('events').select('*').order('event_date', { ascending: true }),
    supabase.from('event_registrations').select('event_id'),
  ])

  const registeredEventIds = (registrations ?? []).map((r) => r.event_id)

  return (
    <div className="space-y-6">
      <EventsClient
        events={events ?? []}
        registeredEventIds={registeredEventIds}
        currentUserId={user.id}
      />
    </div>
  )
}
