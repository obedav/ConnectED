import { cn } from '@/lib/utils/cn'

interface AuthCardProps {
  children: React.ReactNode
  className?: string
}

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <div
      className={cn(
        'w-full max-w-md rounded-2xl border border-gray-100 bg-white px-8 py-10 shadow-sm',
        className
      )}
    >
      {children}
    </div>
  )
}
