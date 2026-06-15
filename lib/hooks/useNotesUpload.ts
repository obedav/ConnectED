'use client'

import { useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export interface UploadResult {
  fileUrl: string
  filePath: string
  fileSize: number
}

const ALLOWED_MIME = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

export function useNotesUpload() {
  const [progress, setProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const upload = useCallback(async (file: File): Promise<UploadResult | null> => {
    if (!ALLOWED_MIME.includes(file.type)) {
      setError('Only PDF and DOCX files are allowed')
      return null
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File must be under 10 MB')
      return null
    }

    setIsUploading(true)
    setProgress(0)
    setError(null)

    // Simulate progress up to ~85% while the real upload runs
    let simPct = 0
    intervalRef.current = setInterval(() => {
      simPct = simPct < 60 ? simPct + 12 : simPct < 85 ? simPct + 3 : simPct
      setProgress(simPct)
    }, 250)

    const ext = file.name.split('.').pop() ?? 'bin'
    const path = `${crypto.randomUUID()}.${ext}`

    const { data, error: uploadError } = await supabase.storage
      .from('notes')
      .upload(path, file, { contentType: file.type })

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (uploadError) {
      setError(uploadError.message)
      setIsUploading(false)
      setProgress(0)
      return null
    }

    setProgress(100)

    const {
      data: { publicUrl },
    } = supabase.storage.from('notes').getPublicUrl(data.path)

    setIsUploading(false)
    return { fileUrl: publicUrl, filePath: data.path, fileSize: file.size }
  }, [])

  return { upload, progress, isUploading, error }
}
