import React from 'react'
import { cn } from '@/lib/utils/cn'

function Pulse({ className }: { className?: string }) {
  return <div className={cn('shimmer rounded-lg', className)} />
}

// ── Post card ────────────────────────────────────────────────────────────────
export function PostCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <Pulse className="h-10 w-10 shrink-0 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Pulse className="h-3.5 w-32" />
          <Pulse className="h-3 w-20" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Pulse className="h-3.5 w-full" />
        <Pulse className="h-3.5 w-5/6" />
        <Pulse className="h-3.5 w-3/4" />
      </div>
      <div className="mt-4 flex gap-4">
        <Pulse className="h-3 w-12" />
        <Pulse className="h-3 w-12" />
      </div>
    </div>
  )
}

// ── Note card ─────────────────────────────────────────────────────────────────
export function NoteCardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <Pulse className="h-10 w-10 shrink-0 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Pulse className="h-3.5 w-40" />
        <div className="flex items-center gap-2">
          <Pulse className="h-5 w-20 rounded-full" />
          <Pulse className="h-3 w-16" />
        </div>
      </div>
      <Pulse className="h-8 w-20 rounded-lg" />
    </div>
  )
}

// ── Tutor card ────────────────────────────────────────────────────────────────
export function TutorCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <Pulse className="h-12 w-12 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Pulse className="h-4 w-28" />
          <Pulse className="h-3 w-20" />
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Pulse key={i} className="h-3.5 w-3.5 rounded-sm" />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Pulse className="h-5 w-16 rounded-full" />
        <Pulse className="h-5 w-20 rounded-full" />
        <Pulse className="h-5 w-14 rounded-full" />
      </div>
      <Pulse className="mt-4 h-9 w-full rounded-xl" />
    </div>
  )
}

// ── Event card ────────────────────────────────────────────────────────────────
export function EventCardSkeleton() {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <Pulse className="h-14 w-14 shrink-0 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Pulse className="h-4 w-48" />
        <Pulse className="h-3 w-32" />
        <Pulse className="h-3 w-24" />
        <div className="flex gap-2 pt-1">
          <Pulse className="h-8 w-24 rounded-lg" />
          <Pulse className="h-8 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

// ── Study buddy card ──────────────────────────────────────────────────────────
export function BuddyCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <Pulse className="h-12 w-12 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Pulse className="h-3.5 w-28" />
          <Pulse className="h-5 w-20 rounded-full" />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Pulse className="h-5 w-16 rounded-full" />
        <Pulse className="h-5 w-20 rounded-full" />
        <Pulse className="h-5 w-12 rounded-full" />
      </div>
      <Pulse className="mt-4 h-9 w-full rounded-xl" />
    </div>
  )
}

// ── Group card ────────────────────────────────────────────────────────────────
export function GroupCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <Pulse className="h-12 w-12 shrink-0 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Pulse className="h-4 w-36" />
          <Pulse className="h-3 w-20" />
          <Pulse className="h-3 w-48" />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Pulse className="h-9 flex-1 rounded-xl" />
        <Pulse className="h-9 w-20 rounded-xl" />
      </div>
    </div>
  )
}

// ── Generic list skeleton (n rows) ────────────────────────────────────────────
export function ListSkeleton({
  rows = 3,
  Skeleton,
}: {
  rows?: number
  Skeleton: () => React.ReactElement
}) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} />
      ))}
    </div>
  )
}

// ── Grid skeleton (n cards) ───────────────────────────────────────────────────
export function GridSkeleton({
  cols = 2,
  rows = 2,
  Skeleton,
}: {
  cols?: number
  rows?: number
  Skeleton: () => React.ReactElement
}) {
  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: cols * rows }, (_, i) => (
        <Skeleton key={i} />
      ))}
    </div>
  )
}
