'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, LogOut, User } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import type { Profile } from '@/types/database.types'
import type { User as SupabaseUser } from '@supabase/supabase-js'

function getInitials(profile: Profile | null, user: SupabaseUser | null): string {
  if (profile?.full_name) {
    const words = profile.full_name.trim().split(/\s+/).filter(Boolean)
    const first = words[0]?.[0]?.toUpperCase() ?? ''
    const second = words[1]?.[0]?.toUpperCase() ?? ''
    const result = first + second
    return result || '?'
  }
  if (profile?.username) {
    return profile.username[0]?.toUpperCase() ?? '?'
  }
  if (user?.email) {
    return user.email[0]?.toUpperCase() ?? '?'
  }
  return '?'
}

function AvatarMenu({
  profile,
  user,
}: {
  profile: Profile | null
  user: SupabaseUser | null
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  async function handleSignOut() {
    setOpen(false)
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initials = getInitials(profile, user)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open user menu"
        aria-expanded={open}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C4865A] text-xs font-bold text-white ring-2 ring-white/20 transition-opacity hover:opacity-90"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 min-w-[160px] overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            <User className="h-3.5 w-3.5 text-gray-400" />
            View Profile
          </Link>
          <div className="border-t border-gray-100" />
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-3.5 w-3.5" />
            Log out
          </button>
        </div>
      )}
    </div>
  )
}

export function Topbar() {
  const { user, profile } = useUser()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between bg-[#3D1F14] px-5">
      {/* Left: logo */}
      <Link href="/feed" className="flex items-center">
        <Logo
          size="sm"
          className="[&_span:last-child]:text-white [&_div]:bg-white/10"
        />
      </Link>

      {/* Right: actions */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button
          aria-label="Notifications"
          className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Bell className="h-4.5 w-4.5 h-[18px] w-[18px]" />
        </button>

        {/* Avatar + dropdown */}
        <AvatarMenu profile={profile} user={user} />

        {/* Direct log-out button */}
        <button
          onClick={handleSignOut}
          className="hidden items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white sm:flex"
        >
          <LogOut className="h-3.5 w-3.5" />
          Log out
        </button>
      </div>
    </header>
  )
}
