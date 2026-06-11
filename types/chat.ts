import type { Profile, Message } from './database.types'

export type MessageWithSender = Message & {
  sender: Profile | null
}

export type Conversation = {
  partner: Profile
  lastMessage: Message
  unreadCount: number
}
