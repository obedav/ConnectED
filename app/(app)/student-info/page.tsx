import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { Avatar } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Student Info',
  description: 'Your school record, booking history, and study buddy connections.',
}
import { colorFromId } from '@/lib/utils/colorHash'
import { formatDate } from '@/lib/utils/formatDate'
import { cn } from '@/lib/utils/cn'

// -----------------------------------------------------------------------
// Local types for nested query results
// -----------------------------------------------------------------------
type BookingRow = {
  id: string
  subject: string
  scheduled_date: string | null
  duration_minutes: number | null
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  created_at: string
  tutor: {
    profile: { full_name: string | null; username: string } | null
  } | null
}

type ConnectionRow = {
  id: string
  created_at: string
  partner: {
    id: string
    full_name: string | null
    username: string
    year_group: string | null
  } | null
}

// -----------------------------------------------------------------------
// Small UI helpers
// -----------------------------------------------------------------------
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
      {children}
    </h2>
  )
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 text-sm">
      <dt className="w-36 shrink-0 text-gray-400">{label}</dt>
      <dd className="flex-1 font-medium text-gray-900">{children}</dd>
    </div>
  )
}

const BOOKING_STATUS: Record<
  BookingRow['status'],
  { label: string; cls: string }
> = {
  pending: { label: 'Pending', cls: 'bg-amber-50 text-amber-600' },
  confirmed: { label: 'Confirmed', cls: 'bg-blue-50 text-blue-600' },
  completed: { label: 'Completed', cls: 'bg-emerald-50 text-emerald-600' },
  cancelled: { label: 'Cancelled', cls: 'bg-red-50 text-red-500' },
}

function getInitials(fullName: string | null | undefined, username: string) {
  if (fullName) {
    const words = fullName.trim().split(/\s+/).filter(Boolean)
    const a = words[0]?.[0]?.toUpperCase() ?? ''
    const b = words[1]?.[0]?.toUpperCase() ?? ''
    return (a + b) || '?'
  }
  return username[0]?.toUpperCase() ?? '?'
}

// -----------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------
export default async function StudentInfoPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch profile and related data in parallel
  const [
    { data: profile },
    { data: bookingRows },
    { data: sentRows },
    { data: receivedRows },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),

    supabase
      .from('tutor_bookings')
      .select(
        'id, subject, scheduled_date, duration_minutes, status, created_at, tutor:peer_tutors!tutor_bookings_tutor_id_fkey(profile:profiles!peer_tutors_user_id_fkey(full_name, username))'
      )
      .eq('student_id', user.id)
      .order('created_at', { ascending: false }),

    supabase
      .from('buddy_connections')
      .select(
        'id, created_at, partner:profiles!buddy_connections_receiver_id_fkey(id, full_name, username, year_group)'
      )
      .eq('requester_id', user.id)
      .eq('status', 'accepted'),

    supabase
      .from('buddy_connections')
      .select(
        'id, created_at, partner:profiles!buddy_connections_requester_id_fkey(id, full_name, username, year_group)'
      )
      .eq('receiver_id', user.id)
      .eq('status', 'accepted'),
  ])

  if (!profile) return null

  const bookings = (bookingRows ?? []) as unknown as BookingRow[]
  const connections: ConnectionRow[] = [
    ...((sentRows ?? []) as unknown as ConnectionRow[]),
    ...((receivedRows ?? []) as unknown as ConnectionRow[]),
  ]

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Student Info"
        subtitle="Your school record and activity summary"
      />

      {/* ── Core student details ── */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <SectionHeading>Student Details</SectionHeading>
        <dl className="space-y-3">
          {profile.student_id && (
            <InfoRow label="Student ID">
              <span className="font-mono">{profile.student_id}</span>
            </InfoRow>
          )}
          {profile.year_group && (
            <InfoRow label="Year group">{profile.year_group}</InfoRow>
          )}
          {profile.house && (
            <InfoRow label="House">{profile.house}</InfoRow>
          )}
          {profile.class_teacher && (
            <InfoRow label="Class teacher">{profile.class_teacher}</InfoRow>
          )}
          {(profile.subjects?.length ?? 0) > 0 && (
            <InfoRow label="Subjects">
              <div className="flex flex-wrap gap-1.5">
                {profile.subjects?.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-[#F5EDE8] px-2.5 py-0.5 text-xs font-medium text-[#9B5941]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </InfoRow>
          )}
        </dl>
      </div>

      {/* ── Account info ── */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <SectionHeading>Account</SectionHeading>
        <dl className="space-y-3">
          <InfoRow label="Email">{user.email ?? '—'}</InfoRow>
          <InfoRow label="Member since">{formatDate(profile.created_at)}</InfoRow>
          <InfoRow label="Username">@{profile.username}</InfoRow>
        </dl>
      </div>

      {/* ── Tutor bookings ── */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <SectionHeading>My Bookings</SectionHeading>

        {bookings.length === 0 ? (
          <p className="text-sm text-gray-400">No tutor bookings yet.</p>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => {
              const statusCfg = BOOKING_STATUS[b.status]
              const tutorName =
                b.tutor?.profile?.full_name ??
                b.tutor?.profile?.username ??
                'Unknown tutor'
              return (
                <div
                  key={b.id}
                  className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-sm text-gray-900">{b.subject}</p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      with {tutorName}
                      {b.scheduled_date && ` · ${formatDate(b.scheduled_date, 'MMM d, yyyy')}`}
                      {b.duration_minutes && ` · ${b.duration_minutes} min`}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium',
                      statusCfg.cls
                    )}
                  >
                    {statusCfg.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Buddy connections ── */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <SectionHeading>My Study Buddies</SectionHeading>

        {connections.length === 0 ? (
          <p className="text-sm text-gray-400">No accepted buddy connections yet.</p>
        ) : (
          <div className="space-y-3">
            {connections.map((conn) => {
              const partner = conn.partner
              if (!partner) return null
              const initials = getInitials(partner.full_name, partner.username)
              const colorClass = colorFromId(partner.id)
              const displayName = partner.full_name ?? partner.username

              return (
                <div
                  key={conn.id}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 p-4"
                >
                  <Avatar
                    fallback={initials}
                    className={cn('shrink-0 text-white', colorClass)}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-sm text-gray-900">
                      {displayName}
                    </p>
                    <p className="text-xs text-gray-400">
                      @{partner.username}
                      {partner.year_group && ` · ${partner.year_group}`}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-600">
                    Connected
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
