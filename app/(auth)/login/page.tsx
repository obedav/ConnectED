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
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Please enter your password'),
})

type FormData = z.infer<typeof schema>

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [authError, setAuthError] = useState<string | null>(null)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async ({ email, password }: FormData) => {
    setAuthError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setAuthError(error.message)
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
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to your account</p>
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
        <Field label="School email or username" error={errors.email?.message}>
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
          <div className="flex flex-col gap-1">
            <Input
              {...register('password')}
              type="password"
              placeholder="Your password"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              className={errors.password ? 'border-red-400 focus-visible:ring-red-300' : ''}
            />
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-xs text-[#9B5941] underline-offset-2 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>
        </Field>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full bg-[#9B5941] text-white hover:bg-[#7D4532] focus-visible:ring-[#9B5941]/40"
        >
          {isSubmitting ? 'Signing in…' : 'Log In'}
        </Button>
      </form>

      <Divider label="or sign up" />

      <Button
        type="button"
        variant="outline"
        className="w-full text-[#9B5941] hover:bg-[#9B5941]/5 focus-visible:ring-[#9B5941]/40"
        onClick={() => router.push('/signup')}
      >
        Create account
      </Button>
    </AuthCard>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
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
