'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bell,
  BookOpen,
  CalendarDays,
  FileText,
  GraduationCap,
  Heart,
  LayoutList,
  Lightbulb,
  MessageSquare,
  Music,
  Radio,
  Rss,
  Search,
  User,
  Users,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

// The 4 primary tabs always visible on the bottom bar
const PRIMARY: NavItem[] = [
  { label: 'Feed',   href: '/feed',        icon: Rss          },
  { label: 'Chats',  href: '/chats',       icon: MessageSquare },
  { label: 'Buddy',  href: '/study-buddy', icon: Users        },
  { label: 'Profile',href: '/profile',     icon: User         },
]

// All remaining links shown in the "More" drawer
const MORE_LINKS: NavItem[] = [
  { label: 'Students League',  href: '/students',        icon: Radio        },
  { label: 'Student Info',     href: '/student-info',    icon: GraduationCap},
  { label: 'Notes Hub',        href: '/notes',           icon: FileText     },
  { label: 'Peer Tutors',      href: '/tutors',          icon: BookOpen     },
  { label: 'Events',           href: '/events',          icon: CalendarDays },
  { label: 'Lost & Found',     href: '/lost-found',      icon: Search       },
  { label: 'Suggestions',      href: '/suggestions',     icon: Lightbulb    },
  { label: 'Academic Updates', href: '/academic',        icon: Bell         },
  { label: 'My Groups',        href: '/groups',          icon: LayoutList   },
  { label: 'Interest Groups',  href: '/interest-groups', icon: Music        },
  { label: 'My Favourites',    href: '/favorites',       icon: Heart        },
]

function BottomTabItem({
  item,
  isActive,
  onClick,
}: {
  item: NavItem
  isActive: boolean
  onClick?: () => void
}) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors',
        isActive ? 'text-[#9B5941]' : 'text-gray-500'
      )}
    >
      <Icon className={cn('h-5 w-5', isActive && 'text-[#9B5941]')} />
      {item.label}
    </Link>
  )
}

export function BottomNav() {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const isMoreActive = MORE_LINKS.some(
    (l) => pathname === l.href || pathname.startsWith(l.href + '/')
  )

  return (
    <>
      {/* Bottom tab bar — visible only on mobile */}
      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-40 flex h-16 border-t border-gray-100 bg-white md:hidden"
      >
        {PRIMARY.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <BottomTabItem
              key={item.href}
              item={item}
              isActive={isActive}
              onClick={() => setDrawerOpen(false)}
            />
          )
        })}

        {/* More button */}
        <button
          onClick={() => setDrawerOpen((v) => !v)}
          className={cn(
            'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors',
            isMoreActive || drawerOpen ? 'text-[#9B5941]' : 'text-gray-500'
          )}
          aria-label="More navigation options"
          aria-expanded={drawerOpen}
        >
          {drawerOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-5 w-5"
            >
              <circle cx="5" cy="12" r="1.5" fill="currentColor" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              <circle cx="19" cy="12" r="1.5" fill="currentColor" />
            </svg>
          )}
          More
        </button>
      </nav>

      {/* More drawer */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30 bg-black/20 md:hidden"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Sheet */}
          <div className="fixed inset-x-0 bottom-16 z-30 overflow-y-auto rounded-t-2xl border-t border-gray-100 bg-white pb-4 shadow-lg md:hidden">
            <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-gray-200" />
            <div className="mt-3 grid grid-cols-3 gap-1 px-4">
              {MORE_LINKS.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + '/')
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-xl p-3 text-xs font-medium transition-colors',
                      isActive
                        ? 'bg-[#F5EDE8] text-[#9B5941]'
                        : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </>
      )}
    </>
  )
}
