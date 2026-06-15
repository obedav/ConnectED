'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ShieldCheck } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils/cn'
import { showToast } from '@/lib/stores/toastStore'

const CATEGORIES = [
  'Academic',
  'Facilities',
  'Student Welfare',
  'Events & Activities',
  'Other',
] as const

const schema = z.object({
  category: z.string().min(1, 'Please select a category'),
  content: z
    .string()
    .min(20, 'Suggestion must be at least 20 characters')
    .max(1000, 'Suggestion must be under 1000 characters'),
})

type FormValues = z.infer<typeof schema>

export default function SuggestionsPage() {
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { category: '', content: '' },
  })

  const content = watch('content')

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null)
    const res = await fetch('/api/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })

    if (!res.ok) {
      const json = (await res.json()) as { error?: string }
      setSubmitError(json.error ?? 'Failed to submit')
      return
    }

    showToast('Suggestion submitted anonymously', 'success')
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Suggestions"
          subtitle="Your voice matters — share your ideas anonymously"
        />
        <div className="flex flex-col items-center gap-5 rounded-2xl border border-gray-100 bg-white py-16 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F5EDE8]">
            <ShieldCheck className="h-8 w-8 text-[#9B5941]" />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">Submitted anonymously</p>
            <p className="mt-1 text-sm text-gray-500">
              Your suggestion has been received. Thank you for sharing!
            </p>
          </div>
          <Button
            onClick={() => {
              reset()
              setSubmitted(false)
            }}
            className="bg-[#9B5941] text-white hover:bg-[#7D4532]"
          >
            Submit another suggestion
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suggestions"
        subtitle="Your voice matters — share your ideas anonymously"
      />

      <div className="mx-auto max-w-xl rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        {/* Anonymity notice */}
        <div className="mb-6 flex items-center gap-2.5 rounded-lg bg-[#F5EDE8] px-4 py-3">
          <ShieldCheck className="h-4 w-4 shrink-0 text-[#9B5941]" />
          <p className="text-sm text-[#9B5941]">Your identity is never stored or shared</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Category */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              {...register('category')}
              className={cn(
                'w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#9B5941]/20',
                errors.category ? 'border-red-300' : 'border-gray-200'
              )}
            >
              <option value="">Select a category…</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="mb-1.5 flex items-center justify-between text-sm font-medium text-gray-700">
              Your suggestion
              <span
                className={cn(
                  'text-xs font-normal',
                  content.length > 900 ? 'text-amber-500' : 'text-gray-400'
                )}
              >
                {content.length}/1000
              </span>
            </label>
            <textarea
              {...register('content')}
              rows={6}
              placeholder="Share your idea, concern, or feedback… (min 20 characters)"
              className={cn(
                'w-full resize-none rounded-lg border bg-white px-3 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9B5941]/20',
                errors.content ? 'border-red-300' : 'border-gray-200'
              )}
            />
            {errors.content && (
              <p className="mt-1 text-xs text-red-500">{errors.content.message}</p>
            )}
          </div>

          {submitError && <p className="text-sm text-red-500">{submitError}</p>}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#9B5941] text-white hover:bg-[#7D4532] disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting…' : 'Submit anonymously'}
          </Button>
        </form>
      </div>
    </div>
  )
}
