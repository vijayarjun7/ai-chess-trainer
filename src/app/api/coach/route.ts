import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { chatWithCoach } from '@/lib/ai'
import type { ExplanationMode } from '@/types/database'
import { z } from 'zod'

const ChatSchema = z.object({
  messages:  z.array(z.object({ role: z.enum(['user', 'coach']), content: z.string() })),
  gameId:    z.string().uuid().optional(),
  skillTags: z.array(z.string()).default([]),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = ChatSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { messages, gameId, skillTags } = parsed.data

  const { data: student } = await supabase
    .from('students')
    .select('id, name, explanation_mode, rating_band')
    .eq('user_id', user.id)
    .single()

  if (!student) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const { reply } = await chatWithCoach(messages, {
    studentName:     student.name,
    explanationMode: student.explanation_mode as ExplanationMode,
    ratingBand:      student.rating_band,
    skillTags,
  })

  // Store interaction
  await supabase.from('coach_interactions').insert([
    ...messages.slice(-2).map(m => ({
      student_id: student.id,
      game_id:    gameId ?? null,
      role:       m.role,
      content:    m.content,
      context:    { skillTags },
    })),
    {
      student_id: student.id,
      game_id:    gameId ?? null,
      role:       'coach',
      content:    reply,
      context:    { skillTags },
    },
  ])

  return NextResponse.json({ reply })
}
