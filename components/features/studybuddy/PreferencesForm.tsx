'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils/cn'

const YEAR_GROUPS = [
  'Year 7',
  'Year 8',
  'Year 9',
  'Year 10',
  'Year 11',
  'Year 12',
] as const

const STUDY_STYLES = [
  'Discussion and explanations',
  'Problem-solving together',
  'Exam preparation sessions',
  'Teaching each other concepts',
  'Silent co-studying',
  'Practice questions',
] as const

const schema = z.object({
  academic_level: z.string().min(1, 'Select your year group'),
  subjects_studying: z
    .array(z.string().min(1))
    .min(1, 'Add at least one subject you are studying'),
  subjects_needing_help: z
    .array(z.string().min(1))
    .min(1, 'Add at least one subject you need help with'),
  study_styles: z
    .array(z.string().min(1))
    .min(1, 'Select at least one study style'),
})

type FormValues = z.infer<typeof schema>

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  error?: string
}

function TagInput({ tags, onChange, placeholder, error }: TagInputProps) {
  const [input, setInput] = useState('')

  function addTag(raw: string) {
    const tag = raw.trim()
    if (tag && !tags.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      onChange([...tags, tag])
    }
    setInput('')
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    if (val.endsWith(',')) {
      addTag(val.slice(0, -1))
    } else {
      setInput(val)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(input)
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  return (
    <div
      className={cn(
        'flex min-h-[44px] flex-wrap items-center gap-1.5 rounded-lg border bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-[#3B1FDB]/20',
        error ? 'border-red-300' : 'border-gray-200'
      )}
    >
      {tags.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 rounded-full bg-[#EDE9FF] px-2.5 py-0.5 text-xs font-medium text-[#3B1FDB]"
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
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="min-w-[140px] flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
      />
    </div>
  )
}

const STEP_LABELS = ['Basics', 'Study style', 'Preview']

interface StepIndicatorProps {
  current: number
}

function StepIndicator({ current }: StepIndicatorProps) {
  return (
    <div className="mb-8 flex items-center justify-center">
      {STEP_LABELS.map((label, idx) => {
        const n = idx + 1
        const done = current > n
        const active = current === n
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
                  done
                    ? 'bg-[#3B1FDB] text-white'
                    : active
                    ? 'bg-[#3B1FDB] text-white'
                    : 'bg-gray-100 text-gray-400'
                )}
              >
                {done ? <Check className="h-4 w-4" /> : n}
              </div>
              <span
                className={cn(
                  'text-[11px] font-medium',
                  active ? 'text-[#3B1FDB]' : 'text-gray-400'
                )}
              >
                {label}
              </span>
            </div>
            {idx < STEP_LABELS.length - 1 && (
              <div
                className={cn(
                  'mb-5 h-0.5 w-16',
                  current > n ? 'bg-[#3B1FDB]' : 'bg-gray-200'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export function PreferencesForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      academic_level: '',
      subjects_studying: [],
      subjects_needing_help: [],
      study_styles: [],
    },
  })

  const academicLevel = watch('academic_level')
  const subjectsStudying = watch('subjects_studying')
  const subjectsNeedingHelp = watch('subjects_needing_help')
  const studyStyles = watch('study_styles')

  async function handleNext() {
    let valid = false
    if (step === 1) {
      valid = await trigger(['academic_level', 'subjects_studying', 'subjects_needing_help'])
    } else if (step === 2) {
      valid = await trigger(['study_styles'])
    }
    if (valid) setStep((s) => s + 1)
  }

  const onSubmit = async (data: FormValues) => {
    setSubmitError(null)
    try {
      const res = await fetch('/api/study-buddy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = (await res.json()) as { error?: string }
        throw new Error(json.error ?? 'Failed to save profile')
      }
      router.refresh()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <StepIndicator current={step} />

        {/* Step 1 — Basic info */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Your year group</h2>
              <p className="mt-0.5 text-sm text-gray-500">We use this to suggest same-year study partners.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {YEAR_GROUPS.map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() =>
                      setValue('academic_level', year, { shouldValidate: true })
                    }
                    className={cn(
                      'rounded-full border px-4 py-1.5 text-sm transition-colors',
                      academicLevel === year
                        ? 'border-[#3B1FDB] bg-[#3B1FDB] text-white'
                        : 'border-gray-200 text-gray-600 hover:border-[#3B1FDB] hover:text-[#3B1FDB]'
                    )}
                  >
                    {year}
                  </button>
                ))}
              </div>
              {errors.academic_level && (
                <p className="mt-1.5 text-xs text-red-500">{errors.academic_level.message}</p>
              )}
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-900">Subjects you are studying</h2>
              <p className="mt-0.5 text-sm text-gray-500">Press Enter or comma to add each subject.</p>
              <div className="mt-3">
                <TagInput
                  tags={subjectsStudying}
                  onChange={(tags) => setValue('subjects_studying', tags, { shouldValidate: true })}
                  placeholder="e.g. Maths, Physics, History…"
                  error={errors.subjects_studying?.message}
                />
                {errors.subjects_studying && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.subjects_studying.message}</p>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-900">Subjects you need help with</h2>
              <p className="mt-0.5 text-sm text-gray-500">We will find buddies who are strong in these areas.</p>
              <div className="mt-3">
                <TagInput
                  tags={subjectsNeedingHelp}
                  onChange={(tags) =>
                    setValue('subjects_needing_help', tags, { shouldValidate: true })
                  }
                  placeholder="e.g. Chemistry, French…"
                  error={errors.subjects_needing_help?.message}
                />
                {errors.subjects_needing_help && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.subjects_needing_help.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Study style */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">How do you like to study?</h2>
              <p className="mt-0.5 text-sm text-gray-500">Select all that apply — minimum one.</p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {STUDY_STYLES.map((style) => {
                const selected = studyStyles.includes(style)
                return (
                  <button
                    key={style}
                    type="button"
                    onClick={() => {
                      const next = selected
                        ? studyStyles.filter((s) => s !== style)
                        : [...studyStyles, style]
                      setValue('study_styles', next, { shouldValidate: true })
                    }}
                    className={cn(
                      'flex items-center gap-2.5 rounded-xl border px-4 py-3 text-left text-sm transition-colors',
                      selected
                        ? 'border-[#3B1FDB] bg-[#EDE9FF] text-[#3B1FDB]'
                        : 'border-gray-200 text-gray-600 hover:border-[#3B1FDB]/50 hover:bg-gray-50'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                        selected ? 'border-[#3B1FDB] bg-[#3B1FDB]' : 'border-gray-300'
                      )}
                    >
                      {selected && <Check className="h-2.5 w-2.5 text-white" />}
                    </span>
                    {style}
                  </button>
                )
              })}
            </div>
            {errors.study_styles && (
              <p className="text-xs text-red-500">{errors.study_styles.message}</p>
            )}
          </div>
        )}

        {/* Step 3 — Preview */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Review your preferences</h2>
              <p className="mt-0.5 text-sm text-gray-500">Here is what we will use to find your matches.</p>
            </div>

            <dl className="divide-y divide-gray-100 rounded-xl border border-gray-100 text-sm">
              <div className="flex gap-4 px-4 py-3">
                <dt className="w-36 shrink-0 font-medium text-gray-500">Year group</dt>
                <dd className="text-gray-900">{academicLevel}</dd>
              </div>
              <div className="px-4 py-3">
                <dt className="mb-2 font-medium text-gray-500">Studying</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {subjectsStudying.map((s) => (
                    <span key={s} className="rounded-full bg-[#EDE9FF] px-2.5 py-0.5 text-xs font-medium text-[#3B1FDB]">{s}</span>
                  ))}
                </dd>
              </div>
              <div className="px-4 py-3">
                <dt className="mb-2 font-medium text-gray-500">Needs help with</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {subjectsNeedingHelp.map((s) => (
                    <span key={s} className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">{s}</span>
                  ))}
                </dd>
              </div>
              <div className="px-4 py-3">
                <dt className="mb-2 font-medium text-gray-500">Study styles</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {studyStyles.map((s) => (
                    <span key={s} className="rounded-full border border-gray-200 px-2.5 py-0.5 text-xs text-gray-600">{s}</span>
                  ))}
                </dd>
              </div>
            </dl>

            {submitError && (
              <p className="text-sm text-red-500">{submitError}</p>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back
            </button>
          ) : (
            <span />
          )}

          {step < 3 ? (
            <Button
              type="button"
              onClick={() => void handleNext()}
              className="bg-[#3B1FDB] text-white hover:bg-[#3018c0]"
            >
              Next →
            </Button>
          ) : (
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={() => void handleSubmit(onSubmit)()}
              className="bg-[#3B1FDB] text-white hover:bg-[#3018c0] disabled:opacity-50"
            >
              {isSubmitting ? 'Finding matches…' : 'Find my matches'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
