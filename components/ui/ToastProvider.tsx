'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { useToastStore } from '@/lib/stores/toastStore'
import { cn } from '@/lib/utils/cn'
import type { Toast, ToastType } from '@/lib/stores/toastStore'

const CONFIG: Record<ToastType, { icon: typeof Info; bar: string; text: string }> = {
  success: { icon: CheckCircle2, bar: 'bg-emerald-500', text: 'text-emerald-700' },
  error:   { icon: XCircle,     bar: 'bg-red-500',     text: 'text-red-700'     },
  info:    { icon: Info,        bar: 'bg-[#9B5941]',   text: 'text-[#9B5941]'  },
}

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((s) => s.dismiss)
  const [exiting, setExiting] = useState(false)
  const cfg = CONFIG[toast.type]
  const Icon = cfg.icon

  function handleDismiss() {
    setExiting(true)
    setTimeout(() => dismiss(toast.id), 160)
  }

  // Auto-dismiss with exit animation
  useEffect(() => {
    const timer = setTimeout(() => setExiting(true), 3600)
    const remove = setTimeout(() => dismiss(toast.id), 3800)
    return () => {
      clearTimeout(timer)
      clearTimeout(remove)
    }
  }, [toast.id, dismiss])

  return (
    <div
      className={cn(
        'pointer-events-auto flex w-full max-w-sm overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/5',
        exiting ? 'toast-exit' : 'toast-enter'
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className={cn('w-1 shrink-0', cfg.bar)} />
      <div className="flex flex-1 items-start gap-3 p-4">
        <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', cfg.text)} />
        <p className="flex-1 text-sm text-gray-800">{toast.message}</p>
        <button
          onClick={handleDismiss}
          className="shrink-0 text-gray-400 transition-colors hover:text-gray-600"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function ToastProvider() {
  const toasts = useToastStore((s) => s.toasts)

  if (toasts.length === 0) return null

  return (
    <div
      aria-label="Notifications"
      className="pointer-events-none fixed bottom-20 right-4 z-[100] flex flex-col gap-2 md:bottom-4"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  )
}
