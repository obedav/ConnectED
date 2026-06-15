import type { Metadata } from 'next'
import { ChatsClient } from '@/components/features/chat/ChatsClient'

export const metadata: Metadata = {
  title: 'Chats',
  description: 'Message your classmates and study partners directly.',
}

export default function ChatsPage() {
  return <ChatsClient />
}
