import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profile',
  description: 'View and edit your ConnectED profile, posts, and shared notes.',
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children
}
