import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

interface EmptyStateAction {
  label: string
  href?: string
  onClick?: () => void
}

interface EmptyStateProps {
  emoji?: string
  icon?: React.ReactNode
  heading: string
  body?: string
  action?: EmptyStateAction
  className?: string
}

export function EmptyState({
  emoji,
  icon,
  heading,
  body,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white py-16 text-center shadow-sm',
        className
      )}
    >
      {(emoji || icon) && (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F5EDE8]">
          {emoji ? (
            <span className="text-3xl" role="img">
              {emoji}
            </span>
          ) : (
            icon
          )}
        </div>
      )}

      <p className="font-semibold text-gray-700">{heading}</p>

      {body && <p className="max-w-xs text-sm text-gray-400">{body}</p>}

      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="mt-1 rounded-xl bg-[#9B5941] px-5 py-2 text-sm font-medium text-white hover:bg-[#7D4532]"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="mt-1 rounded-xl bg-[#9B5941] px-5 py-2 text-sm font-medium text-white hover:bg-[#7D4532]"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  )
}
