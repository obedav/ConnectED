import { cn } from '@/lib/utils/cn'

export interface AvatarProps {
  src?: string
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Avatar({ src, alt, fallback, size = 'md', className }: AvatarProps) {
  const sizeClass = {
    sm: 'h-6 w-6 text-[10px]',
    md: 'h-9 w-9 text-sm',
    lg: 'h-12 w-12 text-base',
  }[size]

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200',
        sizeClass,
        className
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt ?? ''} className="h-full w-full object-cover" />
      ) : (
        <span className="select-none font-semibold uppercase leading-none tracking-tight">
          {fallback?.slice(0, 2) ?? '?'}
        </span>
      )}
    </span>
  )
}
