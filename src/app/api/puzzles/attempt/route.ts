import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { applyPuzzleAttemptToSkills } from '@/lib/skills/tracker'
import type { SkillName } from '@/types/skills'
import { z } from 'zod'

const AttemptSchema = z.object({
  puzzle_id:         z.string().uuid(),
  correct:           z.boolean(),
  time_taken_seconds: z.number().optional(),
  hint_used:         z.boolean().default(false),
  moves_tried:       z.array(z.string()).default([]),
  skill_name:        z.string(),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = AttemptSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { puzzle_id, correct, time_taken_seconds, hint_used, moves_tried, skill_name } = parsed.data

  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!student) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const { data: attempt } = await supabase
    .from('puzzle_attempts')
    .insert({
      student_id:        student.id,
      puzzle_id,
      correct,
      time_taken_seconds: time_taken_seconds ?? null,
      hint_used,
      moves_tried,
    })
    .select()
    .single()

  if (!attempt) return NextResponse.json({ error: 'Failed to save attempt' }, { status: 500 })

  await applyPuzzleAttemptToSkills(
    supabase,
    student.id,
    attempt.id,
    skill_name as SkillName,
    correct,
    hint_used,
    time_taken_seconds ?? null
  )

  return NextResponse.json({ attempt })
}
