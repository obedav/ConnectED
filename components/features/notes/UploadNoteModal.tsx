'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Upload, FileText } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { useNotesUpload } from '@/lib/hooks/useNotesUpload'
import { showToast } from '@/lib/stores/toastStore'
import type { NoteWithAuthor } from '@/types/notes'
import { cn } from '@/lib/utils/cn'

const SUBJECTS = [
  'Art & Design',
  'Biology',
  'Business Studies',
  'Chemistry',
  'Computer Science',
  'Drama',
  'Economics',
  'English Language',
  'English Literature',
  'French',
  'Geography',
  'History',
  'Mathematics',
  'Music',
  'Physical Education',
  'Physics',
  'Psychology',
  'Religious Studies',
  'Sociology',
  'Spanish',
  'Other',
]

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  subject: z.string().min(1, 'Subject is required'),
  subjectOther: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface UploadNoteModalProps {
  onClose: () => void
  onSuccess: (note: NoteWithAuthor) => void
}

export function UploadNoteModal({ onClose, onSuccess }: UploadNoteModalProps) {
  const { upload, progress, isUploading, error: uploadError } = useNotesUpload()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', subject: '', subjectOther: '' },
  })

  const subjectValue = watch('subject')

  function validateAndSetFile(file: File) {
    const ALLOWED = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]
    if (!ALLOWED.includes(file.type)) {
      setFileError('Only PDF and DOCX files are allowed')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setFileError('File must be under 10 MB')
      return
    }
    setFileError(null)
    setSelectedFile(file)
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) validateAndSetFile(file)
  }

  const onSubmit = async (values: FormValues) => {
    if (!selectedFile) {
      setFileError('Please select a file to upload')
      return
    }
    setSubmitError(null)

    const result = await upload(selectedFile)
    if (!result) return

    const subject =
      values.subject === 'Other'
        ? (values.subjectOther?.trim() || 'Other')
        : values.subject

    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: values.title,
        subject,
        file_url: result.fileUrl,
        file_size_bytes: result.fileSize,
      }),
    })

    if (!res.ok) {
      const json = (await res.json()) as { error?: string }
      setSubmitError(json.error ?? 'Failed to save note')
      return
    }

    const { note } = (await res.json()) as { note: NoteWithAuthor }
    showToast('Note uploaded successfully!', 'success')
    onSuccess(note)
  }

  const buttonLabel = isUploading ? 'Uploading…' : isSubmitting ? 'Saving…' : 'Upload Note'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">Upload Notes</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-6">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Title
            </label>
            <Input
              {...register('title')}
              placeholder="e.g. Chapter 3 — Organic Chemistry"
              className={errors.title ? 'border-red-300' : ''}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Subject */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Subject
            </label>
            <select
              {...register('subject')}
              className={cn(
                'w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#9B5941]/20',
                errors.subject ? 'border-red-300' : 'border-gray-200'
              )}
            >
              <option value="">Select a subject…</option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.subject && (
              <p className="mt-1 text-xs text-red-500">{errors.subject.message}</p>
            )}
            {subjectValue === 'Other' && (
              <Input
                {...register('subjectOther')}
                placeholder="Enter subject name"
                className="mt-2"
              />
            )}
          </div>

          {/* File drop zone */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              File{' '}
              <span className="font-normal text-gray-400">(PDF or DOCX, max 10 MB)</span>
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors',
                isDragging
                  ? 'border-[#9B5941] bg-[#F5EDE8]'
                  : fileError
                  ? 'border-red-300 bg-red-50'
                  : selectedFile
                  ? 'border-[#9B5941]/40 bg-[#F5EDE8]/40'
                  : 'border-gray-200 bg-gray-50 hover:border-[#9B5941]/50 hover:bg-[#F5EDE8]/30'
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) validateAndSetFile(file)
                }}
              />
              {selectedFile ? (
                <>
                  <FileText className="h-8 w-8 text-[#9B5941]" />
                  <p className="text-sm font-medium text-[#9B5941]">{selectedFile.name}</p>
                  <p className="text-xs text-gray-400">Click to change file</p>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-[#9B5941]">Click to browse</span> or drag
                    and drop
                  </p>
                  <p className="text-xs text-gray-400">PDF or DOCX up to 10 MB</p>
                </>
              )}
            </div>
            {fileError && <p className="mt-1 text-xs text-red-500">{fileError}</p>}
          </div>

          {/* Upload progress bar */}
          {isUploading && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Uploading…</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-[#9B5941] transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error display */}
          {(uploadError ?? submitError) && (
            <p className="text-sm text-red-500">{uploadError ?? submitError}</p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="bg-[#9B5941] text-white hover:bg-[#7D4532] disabled:opacity-50"
            >
              {buttonLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
