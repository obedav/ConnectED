'use client'

import { useState } from 'react'
import { FileText, Download } from 'lucide-react'
import { Button } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
import { UploadNoteModal } from './UploadNoteModal'
import type { NoteWithAuthor } from '@/types/notes'
import { formatDate } from '@/lib/utils/formatDate'
import { cn } from '@/lib/utils/cn'

function formatBytes(bytes: number | null | undefined): string | null {
  if (bytes == null) return null
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function NoteCard({ note }: { note: NoteWithAuthor }) {
  const [downloads, setDownloads] = useState(note.downloads_count)

  const authorName = note.author?.full_name ?? note.author?.username ?? 'Unknown'
  const fileSize = formatBytes(note.file_size_bytes)

  const meta = [
    `By ${authorName}`,
    formatDate(note.created_at),
    fileSize,
    `${downloads} download${downloads !== 1 ? 's' : ''}`,
  ]
    .filter(Boolean)
    .join(' · ')

  async function handleDownload() {
    try {
      const res = await fetch(`/api/notes/${note.id}/download`, { method: 'POST' })
      if (res.ok) {
        const json = (await res.json()) as { downloads_count: number }
        setDownloads(json.downloads_count)
      }
    } catch {}
    window.open(note.file_url, '_blank')
  }

  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F5EDE8]">
        <FileText className="h-5 w-5 text-[#9B5941]" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-gray-900">{note.title}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#F5EDE8] px-2.5 py-0.5 text-xs font-medium text-[#9B5941]">
            {note.subject}
          </span>
          <span className="truncate text-xs text-gray-400">{meta}</span>
        </div>
      </div>

      <Button
        size="sm"
        variant="outline"
        onClick={() => void handleDownload()}
        className="shrink-0 gap-1.5"
      >
        <Download className="h-3.5 w-3.5" />
        Download
      </Button>
    </div>
  )
}

interface NotesListProps {
  initialNotes: NoteWithAuthor[]
}

export function NotesList({ initialNotes }: NotesListProps) {
  const [notes, setNotes] = useState<NoteWithAuthor[]>(initialNotes)
  const [activeSubject, setActiveSubject] = useState('All Subjects')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const subjects = [
    'All Subjects',
    ...Array.from(new Set(notes.map((n) => n.subject))).sort(),
  ]

  const filtered =
    activeSubject === 'All Subjects'
      ? notes
      : notes.filter((n) => n.subject === activeSubject)

  function handleNewNote(note: NoteWithAuthor) {
    setNotes((prev) => [note, ...prev])
    setIsModalOpen(false)
  }

  return (
    <>
      <PageHeader
        title="Notes Hub"
        subtitle="Browse and share study notes with your classmates"
      >
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#9B5941] text-white hover:bg-[#7D4532]"
        >
          Upload Notes
        </Button>
      </PageHeader>

      {/* Subject filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {subjects.map((subject) => (
          <button
            key={subject}
            onClick={() => setActiveSubject(subject)}
            className={cn(
              'shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              activeSubject === subject
                ? 'bg-[#9B5941] text-white'
                : 'border border-gray-200 bg-white text-gray-600 hover:border-[#9B5941]/50 hover:text-[#9B5941]'
            )}
          >
            {subject}
          </button>
        ))}
      </div>

      {/* Notes list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white py-16 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F5EDE8] text-3xl">
            📄
          </div>
          <p className="font-semibold text-gray-700">No notes yet</p>
          <p className="text-sm text-gray-400">
            {activeSubject === 'All Subjects'
              ? 'Be the first to upload a note!'
              : `No notes found for ${activeSubject}`}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}

      {isModalOpen && (
        <UploadNoteModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleNewNote}
        />
      )}
    </>
  )
}
