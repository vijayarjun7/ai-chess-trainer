import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStudentSkills } from '@/lib/skills/tracker'
import { ensureTodaysPlan, getTodaysPlan, generatePlanFromDiagnostic } from '@/lib/training/dailyPlan'
import { evaluatePlanProgress } from '@/lib/training/dailyPlanEvaluator'
import { DEMO_DAILY_PLAN, isDemoMode } from '@/lib/demo/data'
import { z } from 'zod'

// ── GET /api/training/daily-plan ──────────────────────────────────────────
// Returns today's plan with live-computed progress.
// Creates a diagnostic_needed shell if no plan exists yet.

export async function GET(_req: NextRequest) {
  if (isDemoMode()) {
    return NextResponse.json(DEMO_DAILY_PLAN)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: student } = await supabase
    .from('students')
    .select('id, age')
    .eq('user_id', user.id)
    .single()

  if (!student) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const plan = await ensureTodaysPlan(supabase, student.id)

  // If plan needs a diagnostic game, return early — no progress to evaluate yet
  if (plan.status === 'diagnostic_needed') {
    return NextResponse.json({ plan, progress: [], overallComplete: false, completionPercent: 0, nextRecommendation: null })
  }

  const result = await evaluatePlanProgress(supabase, plan, student.id)
  return NextResponse.json(result)
}

// ── POST /api/training/daily-plan ─────────────────────────────────────────
// Generates (or regenerates) today's plan from a diagnostic game.
// Called by the analysis route immediately after the first game of the day.

const GenerateSchema = z.object({
  diagnostic_game_id: z.string().uuid(),
  skill_tags:         z.array(z.string()).default([]),
})

export async function POST(req: NextRequest) {
  if (isDemoMode()) {
    return NextResponse.json(DEMO_DAILY_PLAN)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body   = await req.json()
  const parsed = GenerateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { diagnostic_game_id, skill_tags } = parsed.data

  const { data: student } = await supabase
    .from('students')
    .select('id, age')
    .eq('user_id', user.id)
    .single()

  if (!student) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  // Guard: only regenerate if plan is still in diagnostic_needed state
  // (prevents overwriting an in-progress plan on repeated calls)
  const existing = await getTodaysPlan(supabase, student.id)
  if (existing && existing.status !== 'diagnostic_needed') {
    const result = await evaluatePlanProgress(supabase, existing, student.id)
    return NextResponse.json(result)
  }

  const skills  = await getStudentSkills(supabase, student.id)
  const plan    = await generatePlanFromDiagnostic(
    supabase, student.id, diagnostic_game_id, skills, skill_tags,
  )
  const result  = await evaluatePlanProgress(supabase, plan, student.id)
  return NextResponse.json(result)
}
