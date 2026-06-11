import type { Database } from './database.types'

export type PostWithAuthor = Database['public']['Tables']['posts']['Row'] & {
  author: Database['public']['Tables']['profiles']['Row'] | null
  liked_by_user: boolean
}

export type PostsPage = {
  posts: PostWithAuthor[]
  nextCursor: string | null
}

export const FEED_PAGE_SIZE = 20
