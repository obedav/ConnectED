import { cn } from '@/lib/utils/cn'

type LogoSize = 'sm' | 'md' | 'lg'

const sizes: Record<LogoSize, { box: string; emoji: string; text: string }> = {
  sm: { box: 'h-7 w-7 rounded-lg',  emoji: 'text-sm',  text: 'text-base' },
  md: { box: 'h-9 w-9 rounded-xl',  emoji: 'text-lg',  text: 'text-xl'  },
  lg: { box: 'h-12 w-12 rounded-2xl', emoji: 'text-2xl', text: 'text-2xl' },
}

interface LogoProps {
  size?: LogoSize
  className?: string
}

export function Logo({ size = 'md', className }: LogoProps) {
  const s = sizes[size]
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div
        className={cn(
          'flex shrink-0 items-center justify-center bg-[#1B0963]',
          s.box
        )}
      >
        <span className={s.emoji} role="img" aria-label="graduation cap">
          🎓
        </span>
      </div>
      <span className={cn('font-bold tracking-tight leading-none', s.text)}>
        <span className="text-gray-900">Connect</span>
        <span className="text-[#A855F7]">ED</span>
      </span>
    </div>
  )
}
