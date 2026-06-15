import type { Note, Profile } from './database.types'

export type NoteWithAuthor = Note & {
  author: Profile | null
}
