'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { cn } from '@/lib/utils/cn'
import type { GroupWithRole } from '@/app/api/groups/route'

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  type: z.enum(['Study group', 'Project group', 'General']),
})

type FormValues = z.infer<typeof schema>

const GROUP_TYPES = ['Study group', 'Project group', 'General'] as const

interface CreateGroupModalProps {
  onClose: () => void
  onSuccess: (group: GroupWithRole) => void
}

export default function CreateGroupModal({ onClose, onSuccess }: CreateGroupModalProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', type: 'Study group' },
  })

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null)
    const res = await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })

    if (!res.ok) {
      const json = (await res.json()) as { error?: string }
      setSubmitError(json.error ?? 'Failed to create group')
      return
    }

    const { group } = (await res.json()) as { group: GroupWithRole }
    onSuccess(group)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">Create Group</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Group name</label>
            <Input
              {...register('name')}
              placeholder="e.g. Year 11 Maths"
              className={errors.name ? 'border-red-300' : ''}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Type</label>
            <div className="flex gap-3">
              {GROUP_TYPES.map((t) => (
                <label key={t} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    value={t}
                    {...register('type')}
                    className="accent-[#9B5941]"
                  />
                  <span>{t}</span>
                </label>
              ))}
            </div>
            {errors.type && (
              <p className="mt-1 text-xs text-red-500">{errors.type.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Description{' '}
              <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="What is this group about?"
              className={cn(
                'w-full resize-none rounded-lg border bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9B5941]/20',
                errors.description ? 'border-red-300' : 'border-gray-200'
              )}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
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
              {isSubmitting ? 'Creating…' : 'Create Group'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
