'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Search, Plus, X, ImageIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button, Input } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
import { formatDate } from '@/lib/utils/formatDate'
import { cn } from '@/lib/utils/cn'
import type { LostItem } from '@/types/database.types'

const supabase = createClient()

// -----------------------------------------------------------------------
// Placeholder colours when no image
// -----------------------------------------------------------------------
const PLACEHOLDER_COLORS = [
  'bg-violet-100',
  'bg-blue-100',
  'bg-emerald-100',
  'bg-amber-100',
  'bg-pink-100',
  'bg-teal-100',
]
function placeholderColor(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h << 5) - h + id.charCodeAt(i)
  return PLACEHOLDER_COLORS[Math.abs(h) % PLACEHOLDER_COLORS.length] ?? 'bg-gray-100'
}

// -----------------------------------------------------------------------
// LostItemCard
// -----------------------------------------------------------------------
function LostItemCard({ item }: { item: LostItem }) {
  const statusCfg =
    item.status === 'found'
      ? { label: 'Found', cls: 'bg-emerald-50 text-emerald-600' }
      : item.status === 'claimed'
      ? { label: 'Claimed', cls: 'bg-blue-50 text-blue-600' }
      : { label: 'Missing', cls: 'bg-red-50 text-red-500' }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      {/* Image / placeholder */}
      <div className={cn('flex h-36 items-center justify-center', placeholderColor(item.id))}>
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image_url}
            alt={item.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <ImageIcon className="h-10 w-10 text-gray-300" />
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="flex-1 font-semibold text-gray-900">{item.title}</p>
          <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium', statusCfg.cls)}>
            {statusCfg.label}
          </span>
        </div>
        {item.location_found && (
          <p className="mt-1 text-xs text-gray-400">📍 {item.location_found}</p>
        )}
        {item.description && (
          <p className="mt-2 line-clamp-2 text-sm text-gray-500">{item.description}</p>
        )}
        <p className="mt-2 text-xs text-gray-300">{formatDate(item.created_at)}</p>
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------
// Report modal
// -----------------------------------------------------------------------
const reportSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  location_found: z.string().max(200).optional(),
  status: z.enum(['missing', 'found']),
})
type ReportValues = z.infer<typeof reportSchema>

function ReportModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: (item: LostItem) => void
}) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReportValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: { title: '', description: '', location_found: '', status: 'missing' },
  })

  function handleImageChange(file: File) {
    if (!file.type.startsWith('image/')) {
      setImageError('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image must be under 5 MB')
      return
    }
    setImageError(null)
    setSelectedImage(file)
  }

  const onSubmit = async (values: ReportValues) => {
    setSubmitError(null)
    let imageUrl: string | undefined

    if (selectedImage) {
      setIsUploading(true)
      const ext = selectedImage.name.split('.').pop() ?? 'jpg'
      const path = `${crypto.randomUUID()}.${ext}`
      const { data, error: uploadErr } = await supabase.storage
        .from('lost-items')
        .upload(path, selectedImage, { contentType: selectedImage.type })
      setIsUploading(false)

      if (uploadErr) {
        setSubmitError(uploadErr.message)
        return
      }

      imageUrl = supabase.storage.from('lost-items').getPublicUrl(data.path).data.publicUrl
    }

    const res = await fetch('/api/lost-items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: values.title,
        description: values.description || undefined,
        location_found: values.location_found || undefined,
        status: values.status,
        image_url: imageUrl,
      }),
    })

    if (!res.ok) {
      const json = (await res.json()) as { error?: string }
      setSubmitError(json.error ?? 'Failed to report item')
      return
    }

    const { item } = (await res.json()) as { item: LostItem }
    onSuccess(item)
  }

  const busy = isSubmitting || isUploading

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">Report Item</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Title</label>
            <Input
              {...register('title')}
              placeholder="e.g. Blue water bottle"
              className={errors.title ? 'border-red-300' : ''}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Status</label>
            <div className="flex gap-3">
              {(['missing', 'found'] as const).map((s) => (
                <label key={s} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    value={s}
                    {...register('status')}
                    className="accent-[#9B5941]"
                  />
                  <span className="capitalize">{s}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Description <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Describe the item…"
              className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9B5941]/20"
            />
          </div>

          {/* Location */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Location <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <Input {...register('location_found')} placeholder="e.g. Science corridor" />
          </div>

          {/* Image upload */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Photo <span className="font-normal text-gray-400">(optional, max 5 MB)</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleImageChange(f)
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center gap-2 rounded-lg border border-dashed border-gray-200 px-4 py-3 text-sm text-gray-500 hover:border-[#9B5941]/50 hover:text-[#9B5941]"
            >
              <ImageIcon className="h-4 w-4" />
              {selectedImage ? selectedImage.name : 'Click to add a photo'}
            </button>
            {imageError && <p className="mt-1 text-xs text-red-500">{imageError}</p>}
          </div>

          {submitError && <p className="text-sm text-red-500">{submitError}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={busy}
              className="bg-[#9B5941] text-white hover:bg-[#7D4532] disabled:opacity-50"
            >
              {isUploading ? 'Uploading…' : isSubmitting ? 'Reporting…' : 'Report Item'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------
type StatusFilter = 'All' | 'Missing' | 'Found'

export default function LostFoundPage() {
  const [items, setItems] = useState<LostItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetch('/api/lost-items')
      .then((r) => (r.ok ? r.json() : []))
      .then((data: unknown) => setItems(Array.isArray(data) ? (data as LostItem[]) : []))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  function handleNewItem(item: LostItem) {
    setItems((prev) => [item, ...prev])
    setIsModalOpen(false)
  }

  const filtered = items.filter((item) => {
    const matchesSearch =
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase()) ||
      item.location_found?.toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Missing' && item.status === 'missing') ||
      (statusFilter === 'Found' && (item.status === 'found' || item.status === 'claimed'))

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Lost & Found" subtitle="Report or search for lost items around school">
        <Button
          onClick={() => setIsModalOpen(true)}
          className="gap-1.5 bg-[#9B5941] text-white hover:bg-[#7D4532]"
        >
          <Plus className="h-4 w-4" />
          Report Item
        </Button>
      </PageHeader>

      {/* Search + filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items…"
            className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9B5941]/20"
          />
        </div>
        <div className="flex gap-2">
          {(['All', 'Missing', 'Found'] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                statusFilter === s
                  ? 'bg-[#9B5941] text-white'
                  : 'border border-gray-200 bg-white text-gray-600 hover:border-[#9B5941]/50 hover:text-[#9B5941]'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className="animate-pulse overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
            >
              <div className="h-36 bg-gray-100" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-2/3 rounded bg-gray-100" />
                <div className="h-3 w-1/2 rounded bg-gray-50" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white py-16 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F5EDE8] text-3xl">
            🔍
          </div>
          <p className="font-semibold text-gray-700">
            {items.length === 0 ? 'No items reported yet' : 'No items match your search'}
          </p>
          <p className="text-sm text-gray-400">
            {items.length === 0
              ? 'Be the first to report a lost or found item.'
              : 'Try adjusting your search or filter.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((item) => (
            <LostItemCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {isModalOpen && (
        <ReportModal onClose={() => setIsModalOpen(false)} onSuccess={handleNewItem} />
      )}
    </div>
  )
}
