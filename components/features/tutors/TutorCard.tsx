'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Avatar, Button } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
import { colorFromId } from '@/lib/utils/colorHash'
import { cn } from '@/lib/utils/cn'
import type { TutorWithProfile } from '@/app/api/tutors/route'
import { BookingModal } from './BookingModal'
import { RegisterTutorModal } from './RegisterTutorModal'

function getInitials(fullName: string | null | undefined, username: string): string {
  if (fullName) {
    const words = fullName.trim().split(/\s+/).filter(Boolean)
    const a = words[0]?.[0]?.toUpperCase() ?? ''
    const b = words[1]?.[0]?.toUpperCase() ?? ''
    return (a + b) || '?'
  }
  return username[0]?.toUpperCase() ?? '?'
}

function StarRating({ rating }: { rating: number }) {
  const n = typeof rating === 'number' ? rating : parseFloat(String(rating))
  const filled = Math.round(n)
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            'h-3.5 w-3.5',
            i < filled ? 'fill-amber-400 text-amber-400' : 'fill-gray-100 text-gray-200'
          )}
        />
      ))}
      <span className="ml-1.5 text-xs text-gray-500">{n.toFixed(1)}</span>
    </div>
  )
}

function TutorCard({
  tutor,
  currentUserId,
  onBook,
}: {
  tutor: TutorWithProfile
  currentUserId: string
  onBook: (tutor: TutorWithProfile) => void
}) {
  const profile = tutor.profile
  if (!profile) return null

  const isOwnProfile = tutor.user_id === currentUserId
  const initials = getInitials(profile.full_name, profile.username)
  const displayName = profile.full_name ?? profile.username
  const colorClass = colorFromId(profile.id)

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      {/* Header row */}
      <div className="flex items-start gap-3">
        <Avatar fallback={initials} className={cn('shrink-0 text-white', colorClass)} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-gray-900">{displayName}</p>
          {(tutor.subjects?.length ?? 0) > 0 && (
            <p className="mt-0.5 truncate text-xs text-gray-500">
              {tutor.subjects?.join(', ')}
            </p>
          )}
        </div>
        <span
          className={cn(
            'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium',
            tutor.is_available
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-gray-100 text-gray-400'
          )}
        >
          {tutor.is_available ? 'Available' : 'Busy'}
        </span>
      </div>

      {/* Subject tags */}
      {(tutor.subjects?.length ?? 0) > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tutor.subjects?.map((s) => (
            <span
              key={s}
              className="rounded-full bg-[#F5EDE8] px-2.5 py-0.5 text-xs font-medium text-[#9B5941]"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Bio */}
      {tutor.bio && (
        <p className="text-xs leading-relaxed text-gray-500">{tutor.bio}</p>
      )}

      {/* Rating + session count */}
      <div className="flex items-center justify-between">
        <StarRating rating={tutor.rating} />
        <span className="text-xs text-gray-400">
          {tutor.total_sessions} session{tutor.total_sessions !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Book button */}
      <Button
        size="sm"
        onClick={() => !isOwnProfile && tutor.is_available && onBook(tutor)}
        disabled={!tutor.is_available || isOwnProfile}
        className={cn(
          'w-full',
          tutor.is_available && !isOwnProfile
            ? 'bg-[#9B5941] text-white hover:bg-[#7D4532]'
            : 'cursor-default bg-gray-100 text-gray-400 hover:bg-gray-100'
        )}
      >
        {isOwnProfile ? 'Your profile' : 'Book a Session'}
      </Button>
    </div>
  )
}

// -----------------------------------------------------------------------
// TutorsList — main page client wrapper
// -----------------------------------------------------------------------

interface TutorsListProps {
  tutors: TutorWithProfile[]
  currentUserId: string
  isAlreadyTutor: boolean
}

export function TutorsList({
  tutors: initialTutors,
  currentUserId,
  isAlreadyTutor,
}: TutorsListProps) {
  const [tutors, setTutors] = useState<TutorWithProfile[]>(initialTutors)
  const [selectedTutor, setSelectedTutor] = useState<TutorWithProfile | null>(null)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [isRegistered, setIsRegistered] = useState(isAlreadyTutor)

  function handleRegistered(newTutor: TutorWithProfile) {
    setTutors((prev) => [newTutor, ...prev])
    setIsRegistered(true)
    setIsRegisterOpen(false)
  }

  return (
    <>
      <PageHeader
        title="Peer Tutors"
        subtitle="Get help from fellow students or offer your expertise"
      />

      {/* Register as Tutor banner */}
      {!isRegistered && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-[#9B5941]/20 bg-[#F5EDE8] px-5 py-4">
          <div>
            <p className="font-semibold text-[#9B5941]">Become a Peer Tutor</p>
            <p className="mt-0.5 text-sm text-[#9B5941]/70">
              Share your knowledge and help classmates in your strong subjects.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setIsRegisterOpen(true)}
            className="shrink-0 bg-[#9B5941] text-white hover:bg-[#7D4532]"
          >
            Register
          </Button>
        </div>
      )}

      {/* Tutor grid */}
      {tutors.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white py-16 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F5EDE8] text-3xl">
            🎓
          </div>
          <p className="font-semibold text-gray-700">No tutors yet</p>
          <p className="text-sm text-gray-400">Be the first to register as a peer tutor!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tutors.map((tutor) => (
            <TutorCard
              key={tutor.id}
              tutor={tutor}
              currentUserId={currentUserId}
              onBook={setSelectedTutor}
            />
          ))}
        </div>
      )}

      {selectedTutor && (
        <BookingModal tutor={selectedTutor} onClose={() => setSelectedTutor(null)} />
      )}

      {isRegisterOpen && (
        <RegisterTutorModal
          onClose={() => setIsRegisterOpen(false)}
          onSuccess={handleRegistered}
        />
      )}
    </>
  )
}
