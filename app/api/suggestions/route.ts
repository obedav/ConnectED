import { z } from 'zod'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

// Uses the service role key so RLS is bypassed entirely.
// No auth check — submissions are intentionally anonymous.
function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const schema = z.object({
  category: z.enum([
    'Academic',
    'Facilities',
    'Student Welfare',
    'Events & Activities',
    'Other',
  ]),
  content: z
    .string()
    .min(20, 'Suggestion must be at least 20 characters')
    .max(1000, 'Suggestion must be under 1000 characters'),
})

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid input'
    return Response.json({ error: message }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin.from('suggestions').insert({
    category: parsed.data.category,
    content: parsed.data.content,
    is_anonymous: true,
  })

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ success: true }, { status: 201 })
}
