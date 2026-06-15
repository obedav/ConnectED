import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Suggestions',
  description: 'Share anonymous feedback and ideas to improve your school.',
}

export default function SuggestionsLayout({ children }: { children: React.ReactNode }) {
  return children
}
