import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Lost & Found',
  description: 'Report a lost item or search for something that has been found around school.',
}

export default function LostFoundLayout({ children }: { children: React.ReactNode }) {
  return children
}
