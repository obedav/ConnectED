import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { MessageWithSender } from '@/types/chat'

// -----------------------------------------------------------------------
// GET /api/messages?partnerId=<uuid>
// Returns the last 50 messages between the current user and the partner,
// then marks unread messages as read.
// -----------------------------------------------------------------------
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const partnerId = request.nextUrl.searchParams.get('partnerId')
  if (!partnerId) return Response.json({ error: 'Missing partnerId' }, { status: 400 })

  const { data: rows, error } = await supabase
    .from('messages')
    .select('*, sender:profiles!messages_sender_id_fkey(*)')
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`
    )
    .order('created_at', { ascending: true })
    .limit(50)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Mark incoming unread messages as read
  await supabase
    .from('messages')
    .update({ read: true })
    .eq('receiver_id', user.id)
    .eq('sender_id', partnerId)
    .eq('read', false)

  const messages: MessageWithSender[] = (rows ?? []).map((row) => ({
    ...row,
    sender: (row as { sender?: unknown }).sender as MessageWithSender['sender'],
  }))

  return Response.json(messages)
}

// -----------------------------------------------------------------------
// POST /api/messages
// Sends a new message from the current user to the specified partner.
// -----------------------------------------------------------------------
const sendSchema = z.object({
  partnerId: z.string().uuid(),
  content: z.string().min(1).max(1000).trim(),
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

  const parsed = sendSchema.safeParse(body)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid input'
    return Response.json({ error: message }, { status: 400 })
  }

  const { partnerId, content } = parsed.data

  const { data: row, error } = await supabase
    .from('messages')
    .insert({ sender_id: user.id, receiver_id: partnerId, content })
    .select('*, sender:profiles!messages_sender_id_fkey(*)')
    .single()

  if (error || !row) {
    return Response.json({ error: error?.message ?? 'Insert failed' }, { status: 500 })
  }

  const message: MessageWithSender = {
    ...row,
    sender: (row as { sender?: unknown }).sender as MessageWithSender['sender'],
  }

  return Response.json({ message }, { status: 201 })
}
