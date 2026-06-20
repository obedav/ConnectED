'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, LogOut, User, Settings } from 'lucide-react'
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
    return (first + second) || '?'
  }
  if (profile?.username) return profile.username[0]?.toUpperCase() ?? '?'
  if (user?.email)       return user.email[0]?.toUpperCase() ?? '?'
  return '?'
}

function AvatarMenu({ profile, user }: { profile: Profile | null; user: SupabaseUser | null }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
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
  const displayName = profile?.full_name ?? profile?.username ?? user?.email ?? ''

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open user menu"
        aria-expanded={open}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#C4865A] to-[#9B5941] text-xs font-bold text-white ring-2 ring-white/20 transition-all duration-150 hover:ring-white/40 active:scale-95"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 min-w-[200px] overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl shadow-black/10">
          {/* User info header */}
          {displayName && (
            <div className="border-b border-gray-50 px-4 py-3">
              <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
              {profile?.username && displayName !== profile.username && (
                <p className="text-xs text-gray-400 truncate">@{profile.username}</p>
              )}
            </div>
          )}

          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              <User className="h-3.5 w-3.5 text-gray-400" />
              View Profile
            </Link>
            <Link
              href="/student-info"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Settings className="h-3.5 w-3.5 text-gray-400" />
              Student Info
            </Link>
          </div>

          <div className="border-t border-gray-100 py-1">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function Topbar() {
  const { user, profile } = useUser()

  return (
    <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between bg-[#2C1608] px-5 shadow-lg shadow-black/20">
      {/* Subtle gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-[#9B5941]/20" />

      <Link href="/feed" className="relative flex items-center">
        <Logo size="sm" className="[&_span:last-child]:text-white [&_div]:bg-white/10" />
      </Link>

      <div className="relative flex items-center gap-2">
        {/* Notification bell */}
        <button
          aria-label="Notifications"
          className="relative flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition-all duration-150 hover:bg-white/10 hover:text-white"
        >
          <Bell className="h-[18px] w-[18px]" />
          {/* Unread dot */}
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#C4865A] ring-2 ring-[#2C1608]" />
        </button>

        <AvatarMenu profile={profile} user={user} />
      </div>
    </header>
  )
}
