import { format, formatDistanceToNow } from 'date-fns'

export function formatDate(date: Date | string, pattern = 'MMM d, yyyy') {
  return format(new Date(date), pattern)
}

export function formatRelative(date: Date | string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}
