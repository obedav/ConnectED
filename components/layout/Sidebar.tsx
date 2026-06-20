'use client'

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
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

const discoverLinks: NavItem[] = [
  { label: 'Feed',           href: '/feed',         icon: Rss          },
  { label: 'Students League',href: '/students',     icon: Radio        },
  { label: 'Profile',        href: '/profile',      icon: User         },
  { label: 'Student Info',   href: '/student-info', icon: GraduationCap},
]

const featureLinks: NavItem[] = [
  { label: 'Study Buddy',      href: '/study-buddy',  icon: Users        },
  { label: 'Notes Hub',        href: '/notes',        icon: FileText     },
  { label: 'Peer Tutors',      href: '/tutors',       icon: BookOpen     },
  { label: 'Chats',            href: '/chats',        icon: MessageSquare},
  { label: 'Events',           href: '/events',       icon: CalendarDays },
  { label: 'Lost & Found',     href: '/lost-found',   icon: Search       },
  { label: 'Suggestions',      href: '/suggestions',  icon: Lightbulb    },
  { label: 'Academic Updates', href: '/academic',     icon: Bell         },
]

const libraryLinks: NavItem[] = [
  { label: 'My Groups',       href: '/groups',          icon: LayoutList },
  { label: 'Interest Groups', href: '/interest-groups', icon: Music      },
  { label: 'My Favorites',    href: '/favorites',       icon: Heart      },
]

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="px-4 pb-1 pt-5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 first:pt-4">
      {label}
    </p>
  )
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive =
    pathname === item.href || pathname.startsWith(item.href + '/')
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 border-l-[3px] px-4 py-2 text-sm transition-colors',
        isActive
          ? 'border-[#9B5941] bg-[#F5EDE8] font-medium text-[#9B5941]'
          : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {item.label}
    </Link>
  )
}

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-[220px] shrink-0 flex-col overflow-y-auto border-r border-gray-100 bg-white md:flex">
      {/* Discover */}
      <SectionLabel label="Discover" />
      <nav aria-label="Discover navigation">
        {discoverLinks.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}
      </nav>

      {/* Features */}
      <SectionLabel label="Features" />
      <nav aria-label="Feature navigation">
        {featureLinks.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}
      </nav>

      {/* Library */}
      <SectionLabel label="Library" />
      <nav aria-label="Library navigation">
        {libraryLinks.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}
      </nav>

      <div className="pb-4" />
    </aside>
  )
}
