'use client'

import { useState, useRef, useEffect } from 'react'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Pencil, X, Heart, MessageCircle, FileText, Camera } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import { Avatar, Button, Input } from '@/components/ui'
import { colorFromId } from '@/lib/utils/colorHash'
import { formatDate, formatRelative } from '@/lib/utils/formatDate'
import { cn } from '@/lib/utils/cn'
import type { Database, Profile, Post, Note } from '@/types/database.types'

type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

const supabase = createClient()

const YEAR_GROUPS = [
  'Year 7',
  'Year 8',
  'Year 9',
  'Year 10',
  'Year 11',
  'Year 12',
] as const

function getInitials(fullName: string | null | undefined, username: string): string {
  if (fullName) {
    const words = fullName.trim().split(/\s+/).filter(Boolean)
    const a = words[0]?.[0]?.toUpperCase() ?? ''
    const b = words[1]?.[0]?.toUpperCase() ?? ''
    return (a + b) || '?'
  }
  return username[0]?.toUpperCase() ?? '?'
}

// -----------------------------------------------------------------------
// Edit Profile Modal
// -----------------------------------------------------------------------
const editSchema = z.object({
  full_name: z.string().max(100, 'Name too long').optional(),
  username: z
    .string()
    .min(3, 'Must be at least 3 characters')
    .max(30, 'Too long')
    .regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers, and underscores only'),
  bio: z.string().max(500, 'Bio too long').optional(),
  year_group: z.string().optional(),
  house: z.string().max(50).optional(),
  subjects_raw: z.string().optional(),
})

type EditValues = z.infer<typeof editSchema>

function EditProfileModal({
  profile,
  userId,
  onClose,
}: {
  profile: Profile
  userId: string
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      full_name: profile.full_name ?? '',
      username: profile.username,
      bio: profile.bio ?? '',
      year_group: profile.year_group ?? '',
      house: profile.house ?? '',
      subjects_raw: (profile.subjects ?? []).join(', '),
    },
  })

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith('blob:')) URL.revokeObjectURL(avatarPreview)
    }
  }, [avatarPreview])

  function handleAvatarFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setSubmitError('Please select an image file')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setSubmitError('Avatar must be under 2 MB')
      return
    }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const onSubmit = async (values: EditValues) => {
    setSubmitError(null)
    let avatarUrl: string | undefined

    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop() ?? 'jpg'
      const path = `${userId}/avatar.${ext}`
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(path, avatarFile, { contentType: avatarFile.type, upsert: true })
      if (uploadErr) {
        setSubmitError(uploadErr.message)
        return
      }
      const publicUrl = supabase.storage
        .from('avatars')
        .getPublicUrl(uploadData.path).data.publicUrl
      avatarUrl = `${publicUrl}?v=${Date.now()}`
    }

    const subjects = (values.subjects_raw ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    const base: ProfileUpdate = {
      full_name: values.full_name?.trim() || null,
      username: values.username,
      bio: values.bio?.trim() || null,
      year_group: (values.year_group || null) as ProfileUpdate['year_group'],
      house: values.house?.trim() || null,
      subjects: subjects.length > 0 ? subjects : null,
    }
    const payload: ProfileUpdate = avatarUrl ? { ...base, avatar_url: avatarUrl } : base

    const { error: updateErr } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', userId)

    if (updateErr) {
      setSubmitError(updateErr.message)
      return
    }

    await queryClient.invalidateQueries({ queryKey: ['profile', userId] })
    onClose()
  }

  const currentInitials = getInitials(profile.full_name, profile.username)
  const currentColor = colorFromId(userId)

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
          <h2 className="text-base font-semibold text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
          {/* Avatar picker */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar
                src={avatarPreview ?? profile.avatar_url ?? undefined}
                fallback={currentInitials}
                size="lg"
                className={cn(
                  'text-white',
                  !avatarPreview && !profile.avatar_url && currentColor
                )}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#9B5941] text-white shadow"
              >
                <Camera className="h-3 w-3" />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleAvatarFile(f)
              }}
            />
            <div>
              <p className="text-sm font-medium text-gray-700">Profile photo</p>
              <p className="text-xs text-gray-400">JPG, PNG up to 2 MB</p>
            </div>
          </div>

          {/* Full name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Full name</label>
            <Input
              {...register('full_name')}
              placeholder="Your full name"
              className={errors.full_name ? 'border-red-300' : ''}
            />
            {errors.full_name && (
              <p className="mt-1 text-xs text-red-500">{errors.full_name.message}</p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Username</label>
            <Input
              {...register('username')}
              placeholder="username"
              className={errors.username ? 'border-red-300' : ''}
            />
            {errors.username && (
              <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>
            )}
          </div>

          {/* Year group + House */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Year group</label>
              <select
                {...register('year_group')}
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#9B5941]/20"
              >
                <option value="">— select —</option>
                {YEAR_GROUPS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">House</label>
              <Input {...register('house')} placeholder="Your house" />
            </div>
          </div>

          {/* Subjects */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Subjects</label>
            <Input
              {...register('subjects_raw')}
              placeholder="Maths, Physics, English…"
            />
            <p className="mt-1 text-xs text-gray-400">Separate with commas</p>
          </div>

          {/* Bio */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Bio</label>
            <textarea
              {...register('bio')}
              rows={3}
              placeholder="Tell people about yourself…"
              className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9B5941]/20"
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
              {isSubmitting ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------
// Profile Page
// -----------------------------------------------------------------------
export default function ProfilePage() {
  const { user, profile, isLoading } = useUser()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'posts' | 'notes'>('posts')

  const { data: posts = [] } = useQuery<Post[]>({
    queryKey: ['user-posts', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false })
      return data ?? []
    },
    enabled: !!user?.id,
  })

  const { data: notes = [] } = useQuery<Note[]>({
    queryKey: ['user-notes', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      const { data } = await supabase
        .from('notes')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false })
      return data ?? []
    },
    enabled: !!user?.id,
  })

  const { data: connections = [] } = useQuery<{ id: string }[]>({
    queryKey: ['connections', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      const { data } = await supabase
        .from('buddy_connections')
        .select('id')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
      return data ?? []
    },
    enabled: !!user?.id,
  })

  if (isLoading || !user || !profile) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="h-36 bg-gray-200" />
          <div className="space-y-3 p-6 pt-14">
            <div className="h-5 w-40 rounded bg-gray-100" />
            <div className="h-4 w-24 rounded bg-gray-100" />
          </div>
        </div>
      </div>
    )
  }

  const initials = getInitials(profile.full_name, profile.username)
  const colorClass = colorFromId(profile.id)
  const displayName = profile.full_name ?? profile.username

  return (
    <div className="space-y-6">
      {/* ── Profile card ── */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {/* Banner */}
        <div className="h-36 bg-gradient-to-r from-[#9B5941] to-[#C4865A]" />

        <div className="px-6 pb-6">
          {/* Avatar overlapping banner */}
          <div className="-mt-9 mb-4">
            <Avatar
              src={profile.avatar_url ?? undefined}
              fallback={initials}
              className={cn(
                'h-[72px] w-[72px] text-xl text-white ring-4 ring-white',
                !profile.avatar_url && colorClass
              )}
            />
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-gray-900">{displayName}</h1>
              <p className="mt-0.5 text-sm text-gray-500">
                @{profile.username}
                {profile.year_group && ` · ${profile.year_group}`}
              </p>
              {profile.bio && (
                <p className="mt-2 max-w-md text-sm text-gray-600">{profile.bio}</p>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditOpen(true)}
              className="shrink-0 gap-1.5"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Profile
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-5 flex gap-8 border-t border-gray-50 pt-5">
            {[
              { label: 'Connections', value: connections.length },
              { label: 'Notes Shared', value: notes.length },
              { label: 'Posts', value: posts.length },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Student details card ── */}
      {(profile.year_group || profile.house || (profile.subjects?.length ?? 0) > 0) && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Student Details
          </h2>
          <dl className="space-y-3 text-sm">
            {profile.year_group && (
              <div className="flex gap-4">
                <dt className="w-32 shrink-0 text-gray-400">Year group</dt>
                <dd className="font-medium text-gray-900">{profile.year_group}</dd>
              </div>
            )}
            {profile.house && (
              <div className="flex gap-4">
                <dt className="w-32 shrink-0 text-gray-400">House</dt>
                <dd className="font-medium text-gray-900">{profile.house}</dd>
              </div>
            )}
            {(profile.subjects?.length ?? 0) > 0 && (
              <div className="flex gap-4">
                <dt className="w-32 shrink-0 pt-0.5 text-gray-400">Subjects</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {profile.subjects?.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-[#F5EDE8] px-2.5 py-0.5 text-xs font-medium text-[#9B5941]"
                    >
                      {s}
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* ── Posts / Notes tabs ── */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex border-b border-gray-100">
          {(['posts', 'notes'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-6 py-3.5 text-sm font-medium capitalize transition-colors',
                activeTab === tab
                  ? 'border-b-2 border-[#9B5941] text-[#9B5941]'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'posts' && (
          <div className="divide-y divide-gray-50">
            {posts.length === 0 ? (
              <p className="py-12 text-center text-sm text-gray-400">No posts yet.</p>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="px-5 py-4">
                  <p className="text-sm leading-relaxed text-gray-800">{post.content}</p>
                  <div className="mt-2.5 flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5" />
                      {post.likes_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3.5 w-3.5" />
                      {post.comments_count}
                    </span>
                    <span>{formatRelative(post.created_at)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="divide-y divide-gray-50">
            {notes.length === 0 ? (
              <p className="py-12 text-center text-sm text-gray-400">No notes shared yet.</p>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F5EDE8]">
                    <FileText className="h-4 w-4 text-[#9B5941]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{note.title}</p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="rounded-full bg-[#F5EDE8] px-2 py-0.5 text-[11px] font-medium text-[#9B5941]">
                        {note.subject}
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(note.created_at)}</span>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-gray-400">
                    {note.downloads_count} dl
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {isEditOpen && (
        <EditProfileModal
          profile={profile}
          userId={user.id}
          onClose={() => setIsEditOpen(false)}
        />
      )}
    </div>
  )
}
