'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, CheckCircle2 } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { cn } from '@/lib/utils/cn'
import { showToast } from '@/lib/stores/toastStore'
import type { TutorWithProfile } from '@/app/api/tutors/route'

const DURATIONS = [
  { label: '30 min', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '1.5 hours', value: 90 },
  { label: '2 hours', value: 120 },
]

const today = new Date().toISOString().split('T')[0]!

const schema = z.object({
  subject: z.string().min(1, 'Subject / topic is required').max(200),
  scheduled_date: z
    .string()
    .min(1, 'Date is required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date'),
  duration_minutes: z.number().int().positive(),
})

type FormValues = z.infer<typeof schema>

interface BookingModalProps {
  tutor: TutorWithProfile
  onClose: () => void
}

export function BookingModal({ tutor, onClose }: BookingModalProps) {
  const [success, setSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const tutorName = tutor.profile?.full_name ?? tutor.profile?.username ?? 'The tutor'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { subject: '', scheduled_date: '', duration_minutes: 60 },
  })

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null)
    const res = await fetch('/api/tutors/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tutor_id: tutor.id,
        subject: values.subject,
        scheduled_date: values.scheduled_date,
        duration_minutes: values.duration_minutes,
      }),
    })

    if (!res.ok) {
      const json = (await res.json()) as { error?: string }
      setSubmitError(json.error ?? 'Failed to create booking')
      return
    }

    setSuccess(true)
    showToast(`Booking requested with ${tutorName}`, 'success')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">Book a Session</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            <div>
              <p className="font-semibold text-gray-900">Booking requested!</p>
              <p className="mt-1 text-sm text-gray-500">
                {tutorName} will confirm shortly.
              </p>
            </div>
            <Button
              onClick={onClose}
              className="mt-2 bg-[#9B5941] text-white hover:bg-[#7D4532]"
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-6">
            <p className="text-sm text-gray-500">
              Booking a session with{' '}
              <span className="font-medium text-gray-800">{tutorName}</span>
            </p>

            {/* Subject / Topic */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Subject / Topic
              </label>
              <Input
                {...register('subject')}
                placeholder="e.g. Quadratic equations"
                className={errors.subject ? 'border-red-300' : ''}
              />
              {errors.subject && (
                <p className="mt-1 text-xs text-red-500">{errors.subject.message}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Date
              </label>
              <Input
                type="date"
                min={today}
                {...register('scheduled_date')}
                className={errors.scheduled_date ? 'border-red-300' : ''}
              />
              {errors.scheduled_date && (
                <p className="mt-1 text-xs text-red-500">{errors.scheduled_date.message}</p>
              )}
            </div>

            {/* Duration */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Duration
              </label>
              <select
                {...register('duration_minutes', { valueAsNumber: true })}
                className={cn(
                  'w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#9B5941]/20',
                  errors.duration_minutes ? 'border-red-300' : 'border-gray-200'
                )}
              >
                {DURATIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            {submitError && <p className="text-sm text-red-500">{submitError}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#9B5941] text-white hover:bg-[#7D4532] disabled:opacity-50"
              >
                {isSubmitting ? 'Booking…' : 'Request Booking'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
