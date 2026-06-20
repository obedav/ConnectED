'use client'

import { Suspense, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AuthCard } from '@/components/ui/AuthCard'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'

const schema = z.object({
  username: z
    .string()
    .min(3, 'Must be at least 3 characters')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Only letters, numbers, and underscores are allowed'
    ),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Must be at least 8 characters'),
})

type FormData = z.infer<typeof schema>

function SignUpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [authError, setAuthError] = useState<string | null>(null)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async ({ username, email, password }: FormData) => {
    setAuthError(null)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: isTaken, error: rpcError } = await (supabase as any).rpc('is_username_taken', {
      uname: username,
    })

    if (rpcError) {
      setAuthError('Could not verify username availability. Please try again.')
      return
    }

    if (isTaken) {
      setError('username', { message: 'Username is already taken' })
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    })

    if (error) {
      setAuthError(
        error.message === 'Database error saving new user'
          ? 'Failed to create your account. Please try again or contact support.'
          : error.message
      )
      return
    }

    const next = searchParams.get('next') ?? '/feed'
    router.push(next)
  }

  return (
    <AuthCard>
      <div className="flex flex-col items-center gap-5">
        <Logo size="lg" />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
          <p className="mt-1 text-sm text-gray-500">Join your school community</p>
        </div>
      </div>

      {authError && (
        <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {authError}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-6 flex flex-col gap-4"
      >
        <Field label="Username" error={errors.username?.message}>
          <Input
            {...register('username')}
            placeholder="your_username"
            autoComplete="username"
            aria-invalid={!!errors.username}
            className={errors.username ? 'border-red-400 focus-visible:ring-red-300' : ''}
          />
        </Field>

        <Field label="School Email" error={errors.email?.message}>
          <Input
            {...register('email')}
            type="email"
            placeholder="you@school.edu"
            autoComplete="email"
            aria-invalid={!!errors.email}
            className={errors.email ? 'border-red-400 focus-visible:ring-red-300' : ''}
          />
        </Field>

        <Field label="Password" error={errors.password?.message}>
          <Input
            {...register('password')}
            type="password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            className={errors.password ? 'border-red-400 focus-visible:ring-red-300' : ''}
          />
        </Field>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full bg-[#9B5941] text-white hover:bg-[#7D4532] focus-visible:ring-[#9B5941]/40"
        >
          {isSubmitting ? 'Signing up…' : 'Sign Up'}
        </Button>
      </form>

      <Divider label="or log in" />

      <Button
        type="button"
        variant="outline"
        className="w-full text-[#9B5941] hover:bg-[#9B5941]/5 focus-visible:ring-[#9B5941]/40"
        onClick={() => router.push('/login')}
      >
        Log in
      </Button>

      <p className="mt-6 text-center text-xs leading-relaxed text-gray-400">
        By signing up you agree to our{' '}
        <Link href="/terms" className="text-[#9B5941] underline-offset-2 hover:underline">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="text-[#9B5941] underline-offset-2 hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </AuthCard>
  )
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  )
}

// ---- local sub-components ------------------------------------------------

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

function Divider({ label }: { label: string }) {
  return (
    <div className="my-5 flex items-center gap-3">
      <div className="h-px flex-1 bg-gray-200" />
      <span className="text-xs text-gray-400">{label}</span>
      <div className="h-px flex-1 bg-gray-200" />
    </div>
  )
}
