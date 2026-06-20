import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2',
        'text-sm text-gray-900 placeholder:text-gray-400',
        'transition-[border-color,box-shadow] duration-150',
        'focus:border-[#9B5941]/40 focus:outline-none focus:ring-2 focus:ring-[#9B5941]/10',
        'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60',
        className
      )}
      {...props}
    />
  )
)
Input.displayName = 'Input'

export { Input }
