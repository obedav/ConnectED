'use client'

import { ChevronLeft, Search, ImageIcon, MoreHorizontal } from 'lucide-react'
import { Avatar } from '@/components/ui'
import { Button } from '@/components/ui'
import { colorFromId } from '@/lib/utils/colorHash'
import { cn } from '@/lib/utils/cn'
import type { Profile } from '@/types/database.types'

interface ContactPanelProps {
  partner: Profile | null
  onBack?: () => void
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

const ACTIONS = [
  { icon: Search, label: 'Search' },
  { icon: ImageIcon, label: 'Images' },
  { icon: MoreHorizontal, label: 'Options' },
] as const

export function ContactPanel({ partner, onBack }: ContactPanelProps) {
  if (!partner) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-center text-sm text-gray-400">Select a conversation to see contact info</p>
      </div>
    )
  }

  const initials = getInitials(partner.full_name, partner.username)
  const displayName = partner.full_name ?? partner.username
  const colorClass = colorFromId(partner.id)

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4">
      {onBack && (
        <button
          onClick={onBack}
          className="mb-3 flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700 lg:hidden"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
      )}

      <div className="flex flex-col items-center gap-3 pt-4 text-center">
        <Avatar
          fallback={initials}
          size="lg"
          className={cn('h-16 w-16 text-xl text-white', colorClass)}
        />
        <div>
          <p className="font-semibold text-gray-900">{displayName}</p>
          {partner.year_group && (
            <p className="mt-0.5 text-xs text-gray-400">{partner.year_group}</p>
          )}
          {partner.house && (
            <p className="text-xs text-gray-400">{partner.house} House</p>
          )}
        </div>

        <Button
          size="sm"
          variant="outline"
          className="w-full border-[#9B5941] text-[#9B5941] hover:bg-[#F5EDE8]"
        >
          View Profile
        </Button>
      </div>

      <div className="mt-6 border-t border-gray-100 pt-4">
        <div className="flex justify-around">
          {ACTIONS.map(({ icon: Icon, label }) => (
            <button
              key={label}
              aria-label={label}
              className="flex flex-col items-center gap-1 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-[#9B5941]"
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px]">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {partner.bio && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <p className="text-xs font-medium text-gray-500">Bio</p>
          <p className="mt-1 text-xs leading-relaxed text-gray-600">{partner.bio}</p>
        </div>
      )}
    </div>
  )
}
