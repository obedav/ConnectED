'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils/cn'
import type { TutorWithProfile } from '@/app/api/tutors/route'

const schema = z.object({
  subjects: z.array(z.string().min(1)).min(1, 'Add at least one subject'),
  bio: z.string().max(200, 'Bio must be 200 characters or less').optional(),
})

type FormValues = z.infer<typeof schema>

function TagInput({
  tags,
  onChange,
  error,
}: {
  tags: string[]
  onChange: (tags: string[]) => void
  error?: string
}) {
  const [input, setInput] = useState('')

  function addTag(raw: string) {
    const tag = raw.trim()
    if (tag && !tags.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      onChange([...tags, tag])
    }
    setInput('')
  }

  return (
    <div
      className={cn(
        'flex min-h-[44px] flex-wrap items-center gap-1.5 rounded-lg border bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-[#9B5941]/20',
        error ? 'border-red-300' : 'border-gray-200'
      )}
    >
      {tags.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 rounded-full bg-[#F5EDE8] px-2.5 py-0.5 text-xs font-medium text-[#9B5941]"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(tags.filter((t) => t !== tag))}
            aria-label={`Remove ${tag}`}
            className="leading-none opacity-70 hover:opacity-100"
          >
            ×
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => {
          const val = e.target.value
          if (val.endsWith(',')) {
            addTag(val.slice(0, -1))
          } else {
            setInput(val)
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            addTag(input)
          }
          if (e.key === 'Backspace' && !input && tags.length > 0) {
            onChange(tags.slice(0, -1))
          }
        }}
        placeholder={tags.length === 0 ? 'e.g. Maths, Chemistry… (press Enter or comma)' : ''}
        className="min-w-[160px] flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
      />
    </div>
  )
}

interface RegisterTutorModalProps {
  onClose: () => void
  onSuccess: (tutor: TutorWithProfile) => void
}

export function RegisterTutorModal({ onClose, onSuccess }: RegisterTutorModalProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { subjects: [], bio: '' },
  })

  const subjects = watch('subjects')
  const bio = watch('bio') ?? ''

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null)
    const res = await fetch('/api/tutors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subjects: values.subjects,
        bio: values.bio?.trim() || undefined,
      }),
    })

    if (!res.ok) {
      const json = (await res.json()) as { error?: string }
      setSubmitError(json.error ?? 'Failed to register')
      return
    }

    const { tutor } = (await res.json()) as { tutor: TutorWithProfile }
    onSuccess(tutor)
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
          <h2 className="text-base font-semibold text-gray-900">Register as Tutor</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-6">
          {/* Subjects tag input */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Subjects you can tutor
            </label>
            <TagInput
              tags={subjects}
              onChange={(tags) => setValue('subjects', tags, { shouldValidate: true })}
              error={errors.subjects?.message}
            />
            {errors.subjects && (
              <p className="mt-1 text-xs text-red-500">{errors.subjects.message}</p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="mb-1.5 flex items-center justify-between text-sm font-medium text-gray-700">
              Short bio
              <span
                className={cn(
                  'text-xs font-normal',
                  bio.length > 180 ? 'text-amber-500' : 'text-gray-400'
                )}
              >
                {bio.length}/200
              </span>
            </label>
            <textarea
              {...register('bio')}
              rows={3}
              placeholder="Tell students about your tutoring style and experience…"
              className={cn(
                'w-full resize-none rounded-lg border bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9B5941]/20',
                errors.bio ? 'border-red-300' : 'border-gray-200'
              )}
            />
            {errors.bio && (
              <p className="mt-1 text-xs text-red-500">{errors.bio.message}</p>
            )}
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
              {isSubmitting ? 'Registering…' : 'Register as Tutor'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
