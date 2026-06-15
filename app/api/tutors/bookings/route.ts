import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// -----------------------------------------------------------------------
// POST /api/tutors/bookings
// Creates a new tutor booking with status "pending".
// -----------------------------------------------------------------------
const bookingSchema = z.object({
  tutor_id: z.string().uuid('Invalid tutor ID'),
  subject: z.string().min(1, 'Subject is required').max(200),
  topic: z.string().max(500).optional(),
  scheduled_date: z
    .string()
    .min(1, 'Date is required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  duration_minutes: z.number().int().positive('Duration is required'),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = bookingSchema.safeParse(body)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid input'
    return Response.json({ error: message }, { status: 400 })
  }

  const { data: row, error } = await supabase
    .from('tutor_bookings')
    .insert({
      tutor_id: parsed.data.tutor_id,
      student_id: user.id,
      subject: parsed.data.subject,
      topic: parsed.data.topic ?? null,
      scheduled_date: parsed.data.scheduled_date,
      duration_minutes: parsed.data.duration_minutes,
      status: 'pending',
    })
    .select()
    .single()

  if (error || !row) {
    return Response.json({ error: error?.message ?? 'Booking failed' }, { status: 500 })
  }

  return Response.json({ booking: row }, { status: 201 })
}
