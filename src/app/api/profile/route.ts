import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { initializeStudentSkills } from '@/lib/skills/tracker'
import { explanationModeFromAge } from '@/lib/adaptive/difficulty'
import { z } from 'zod'

const ProfileSchema = z.object({
  name:         z.string().min(1).max(100),
  age:          z.number().min(4).max(99).optional(),
  rating_band:  z.string().default('beginner'),
  skill_level:  z.string().default('beginner'),
  parent_mode:  z.boolean().default(false),
})

// Starting rating per band — keeps AI level appropriate from day one
const STARTING_RATING: Record<string, number> = {
  beginner:    200,   // → AI level 2 (most forgiving)
  '400-700':   500,   // → AI level 3
  '700-1000':  800,   // → AI level 5
  '1000-1300': 1100,  // → AI level 7
  '1300+':     1400,  // → AI level 9
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = ProfileSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { name, age, rating_band, skill_level, parent_mode } = parsed.data
  const explanation_mode   = explanationModeFromAge(age ?? null)
  const estimated_rating   = STARTING_RATING[rating_band] ?? 200

  const { data: student, error } = await supabase
    .from('students')
    .upsert(
      {
        user_id: user.id,
        name,
        age:    age ?? null,
        rating_band,
        estimated_rating,
        skill_level,
        explanation_mode,
        parent_mode,
        onboarding_done: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Initialize skill records for new profiles
  await initializeStudentSkills(supabase, student.id)

  return NextResponse.json({ student })
}

export async function GET(_req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: student } = await supabase
    .from('students')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return NextResponse.json({ student: student ?? null })
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const { data: student } = await supabase
    .from('students')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .select()
    .single()

  return NextResponse.json({ student })
}
