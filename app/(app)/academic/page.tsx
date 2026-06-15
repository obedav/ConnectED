import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { formatDate } from '@/lib/utils/formatDate'

export const metadata: Metadata = {
  title: 'Academic Updates',
  description: 'Official school notices, timetable changes, and exam results.',
}
import { CalendarDays, ClipboardList, Building2, Bell } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { Database } from '@/types/database.types'

type AcademicUpdate = Database['public']['Tables']['academic_updates']['Row']

const CATEGORY_CONFIG: Record<
  string,
  { icon: typeof Bell; bg: string; badge: string }
> = {
  Timetable: {
    icon: CalendarDays,
    bg: 'bg-blue-100 text-blue-600',
    badge: 'bg-blue-50 text-blue-600',
  },
  Results: {
    icon: ClipboardList,
    bg: 'bg-emerald-100 text-emerald-600',
    badge: 'bg-emerald-50 text-emerald-600',
  },
  Facilities: {
    icon: Building2,
    bg: 'bg-amber-100 text-amber-600',
    badge: 'bg-amber-50 text-amber-600',
  },
}

const DEFAULT_CONFIG = {
  icon: Bell,
  bg: 'bg-gray-100 text-gray-500',
  badge: 'bg-gray-100 text-gray-500',
}

function UpdateCard({ update }: { update: AcademicUpdate }) {
  const config = CATEGORY_CONFIG[update.category ?? ''] ?? DEFAULT_CONFIG
  const Icon = config.icon

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        {/* Category icon */}
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            config.bg
          )}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          {/* Title + badge + date row */}
          <div className="flex flex-wrap items-start gap-2">
            <p className="flex-1 font-semibold text-gray-900">{update.title}</p>
            {update.category && (
              <span
                className={cn(
                  'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium',
                  config.badge
                )}
              >
                {update.category}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-gray-400">{formatDate(update.created_at)}</p>

          {/* Full content */}
          <p className="mt-3 text-sm leading-relaxed text-gray-600">{update.content}</p>
        </div>
      </div>
    </div>
  )
}

export default async function AcademicPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: updates } = await supabase
    .from('academic_updates')
    .select('*')
    .order('created_at', { ascending: false })

  const items = updates ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Updates"
        subtitle="Official notices, timetable changes, and results"
      />

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white py-16 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F5EDE8] text-3xl">
            📋
          </div>
          <p className="font-semibold text-gray-700">No updates yet</p>
          <p className="text-sm text-gray-400">Academic notices will appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((update) => (
            <UpdateCard key={update.id} update={update} />
          ))}
        </div>
      )}
    </div>
  )
}
