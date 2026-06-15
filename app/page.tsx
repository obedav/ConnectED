import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'ConnectED — Your School Social Platform',
  description:
    'ConnectED brings your classmates, notes, tutors, events, and conversations together in one place. Built for school life.',
}
import {
  BookOpen,
  CalendarDays,
  FileText,
  MessageSquare,
  Rss,
  Search,
  Users,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Rss,
    title: 'School Feed',
    description: 'Stay up to date with posts, announcements, and moments shared by your classmates.',
  },
  {
    icon: MessageSquare,
    title: 'Direct Chats',
    description: 'Message any student instantly with real-time delivery — no third-party app needed.',
  },
  {
    icon: Users,
    title: 'Study Buddy',
    description: 'Get matched with classmates who share your subjects, study style, and goals.',
  },
  {
    icon: FileText,
    title: 'Notes Hub',
    description: 'Upload and download class notes. Help others and build your own resource library.',
  },
  {
    icon: BookOpen,
    title: 'Peer Tutors',
    description: 'Book one-to-one sessions with top students in any subject — rated and reviewed.',
  },
  {
    icon: CalendarDays,
    title: 'Events',
    description: 'Browse every upcoming school event, register your place, and never miss a thing.',
  },
  {
    icon: Search,
    title: 'Lost & Found',
    description: 'Report or search for lost items around school, with photo uploads supported.',
  },
  {
    icon: Users,
    title: 'Groups',
    description: 'Create study groups, join interest groups, and discuss with people who get it.',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans text-[#3D1F14]">

      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 border-b border-[#D4A96A]/30 bg-[#FAF7F2]/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <span className="text-xl font-bold tracking-tight text-[#6B3A1F]">
            Connect<span className="text-[#9B5941]">ED</span>
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-[#6B3A1F] transition-colors hover:bg-[#F5EDE8]"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-[#9B5941] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7D4532]"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="mx-auto max-w-6xl px-5 py-24 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#D4A96A]/40 bg-[#F5EDE8] px-4 py-1.5 text-sm font-medium text-[#9B5941]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#9B5941]" />
          Built for your school
        </div>

        <h1 className="mx-auto max-w-3xl text-5xl font-bold leading-tight tracking-tight text-[#3D1F14] sm:text-6xl">
          Everything your school life needs,{' '}
          <span className="text-[#9B5941]">in one place</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[#6B3A1F]/80">
          ConnectED brings your classmates, notes, tutors, events, and conversations
          together so you can focus on what matters — learning and growing.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="rounded-xl bg-[#9B5941] px-8 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-[#7D4532]"
          >
            Get started — it's free
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-[#D4A96A]/60 bg-white px-8 py-3.5 text-base font-semibold text-[#6B3A1F] transition-colors hover:bg-[#F5EDE8]"
          >
            Already a member? Log in
          </Link>
        </div>
      </section>

      {/* ── Feature grid ── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-[#3D1F14] sm:text-4xl">
              One app for everything
            </h2>
            <p className="mt-3 text-[#6B3A1F]/70">
              Every feature your school day demands, from first bell to last.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl border border-[#D4A96A]/20 bg-[#FAF7F2] p-6 transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#9B5941]/10">
                  <Icon className="h-5 w-5 text-[#9B5941]" />
                </div>
                <h3 className="font-semibold text-[#3D1F14]">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#6B3A1F]/70">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social proof / callout ── */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="rounded-3xl bg-[#9B5941] px-8 py-16 text-center text-white">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Ready to connect with your school?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-white/80">
              Join your classmates on ConnectED and make the most of every school day.
            </p>
            <Link
              href="/signup"
              className="mt-8 inline-block rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-[#9B5941] transition-colors hover:bg-[#F5EDE8]"
            >
              Create your account
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#D4A96A]/30 py-8">
        <div className="mx-auto max-w-6xl px-5 text-center text-sm text-[#6B3A1F]/60">
          © {new Date().getFullYear()} ConnectED. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
