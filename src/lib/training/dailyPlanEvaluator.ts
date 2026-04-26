import type { SupabaseClient } from '@supabase/supabase-js'
import type { Skill } from '@/types/database'
import type { SkillName } from '@/types/skills'
import type {
  DailyPlan,
  DailyTarget,
  DailyPlanWithProgress,
  TargetProgress,
} from '@/types/training'
import { SKILL_CATALOG } from '@/types/skills'

// ── Progress evaluation ───────────────────────────────────────────────────

export async function evaluatePlanProgress(
  supabase: SupabaseClient,
  plan: DailyPlan,
  studentId: string,
): Promise<DailyPlanWithProgress> {
  const progress = await Promise.all(
    plan.targets.map(t => evaluateTargetProgress(supabase, t, studentId, plan.date, plan.diagnosticGameId)),
  )

  const primaryProgress = progress.find(p => p.priority === 'primary') ?? null
  const overallComplete = primaryProgress?.isComplete ?? false

  // Completion % for the primary target progress bar
  const completionPercent = primaryProgress
    ? computeCompletionPercent(primaryProgress, plan.targets.find(t => t.priority === 'primary')!)
    : 0

  const nextRecommendation = overallComplete
    ? buildNextRecommendation(plan)
    : null

  // Auto-transition status in DB if primary just completed
  if (overallComplete && plan.status === 'in_progress') {
    await supabase
      .from('daily_plans')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', plan.id)
  }

  return { plan, progress, overallComplete, completionPercent, nextRecommendation }
}

async function evaluateTargetProgress(
  supabase: SupabaseClient,
  target: DailyTarget,
  studentId: string,
  planDate: string,
  diagnosticGameId: string | null,
): Promise<TargetProgress> {
  const startOfDay = `${planDate}T00:00:00.000Z`
  const endOfDay   = `${planDate}T23:59:59.999Z`

  // ── 1. Lesson completion: look for a skill_event of type 'lesson_complete' ──
  const { count: lessonEventCount } = await supabase
    .from('skill_events')
    .select('id', { count: 'exact', head: true })
    .eq('student_id', studentId)
    .eq('skill_name', target.skill)
    .eq('event_type', 'lesson_complete')
    .gte('created_at', startOfDay)
    .lte('created_at', endOfDay)

  const lessonCompleted = (lessonEventCount ?? 0) > 0

  // ── 2. Puzzle attempts: join puzzle_attempts → puzzles by theme ────────────
  // Step 1: get puzzle IDs that match this skill theme
  const { data: matchingPuzzles } = await supabase
    .from('puzzles')
    .select('id')
    .eq('theme', target.skill)
    .limit(200)

  const puzzleIds = (matchingPuzzles ?? []).map(p => p.id)

  let puzzlesAttempted = 0
  let puzzlesCorrect   = 0

  if (puzzleIds.length > 0) {
    const { data: attempts } = await supabase
      .from('puzzle_attempts')
      .select('correct')
      .eq('student_id', studentId)
      .in('puzzle_id', puzzleIds)
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay)
      .limit(50)

    puzzlesAttempted = attempts?.length ?? 0
    puzzlesCorrect   = attempts?.filter(a => a.correct).length ?? 0
  }

  const puzzleAccuracy = puzzlesAttempted > 0
    ? Math.round((puzzlesCorrect / puzzlesAttempted) * 100)
    : 0

  // ── 3. Focused game: any game today that is NOT the diagnostic ────────────
  let gamesPlayedToday = 0
  if (target.focusedGameRequired) {
    let query = supabase
      .from('games')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', studentId)
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay)

    if (diagnosticGameId) query = query.neq('id', diagnosticGameId)

    const { count } = await query
    gamesPlayedToday = count ?? 0
  }

  // ── Completion logic ──────────────────────────────────────────────────────
  const lessonDone = !target.lessonTheme || lessonCompleted
  const puzzlesDone = puzzlesCorrect >= target.puzzlePassThreshold
  const gameDone    = !target.focusedGameRequired || gamesPlayedToday > 0
  const isComplete  = lessonDone && puzzlesDone && gameDone

  const remaining: string[] = []
  if (!lessonDone)
    remaining.push(`Complete the ${target.skillLabel} lesson`)
  if (!puzzlesDone)
    remaining.push(`Solve ${target.puzzlePassThreshold - puzzlesCorrect} more ${target.skillLabel} puzzle${target.puzzlePassThreshold - puzzlesCorrect !== 1 ? 's' : ''}`)
  if (!gameDone)
    remaining.push('Play a focused game')

  return {
    targetId:          target.id,
    skill:             target.skill,
    skillLabel:        target.skillLabel,
    priority:          target.priority,
    lessonCompleted,
    puzzlesAttempted,
    puzzlesCorrect,
    puzzleAccuracy,
    gamesPlayedToday,
    isComplete,
    activitiesRemaining: remaining,
  }
}

// ── Completion percent for the primary target ─────────────────────────────

function computeCompletionPercent(p: TargetProgress, t: DailyTarget): number {
  let done  = 0
  let total = 0

  if (t.lessonTheme) {
    total += 1
    if (p.lessonCompleted) done += 1
  }

  total += t.puzzlePassThreshold
  done  += Math.min(p.puzzlesCorrect, t.puzzlePassThreshold)

  if (t.focusedGameRequired) {
    total += 1
    if (p.gamesPlayedToday > 0) done += 1
  }

  return total > 0 ? Math.round((done / total) * 100) : 0
}

// ── Next-day recommendation ───────────────────────────────────────────────

function buildNextRecommendation(plan: DailyPlan): string {
  if (!plan.secondaryWeakness) {
    return 'Outstanding! Keep playing daily to maintain your edge.'
  }
  const label = SKILL_CATALOG[plan.secondaryWeakness as SkillName]?.label ?? plan.secondaryWeakness
  return `Tomorrow, focus on ${label} — it is your next area to strengthen.`
}

// Returns the next weakest skill to target, skipping the current primary.
export function recommendNextWeakness(
  skills: Skill[],
  currentPrimary: SkillName | null,
): SkillName | null {
  const sorted = [...skills].sort((a, b) => a.score - b.score)
  const next   = sorted.find(
    s => s.skill_name !== currentPrimary && s.score < 65,
  )
  return next ? (next.skill_name as SkillName) : null
}

// ── Difficulty reduction for repeat_needed ────────────────────────────────

// When a plan is marked repeat_needed, reduce puzzle threshold so it is
// achievable (helps maintain confidence for young learners).
export function reducedThresholdForRepeat(target: DailyTarget): number {
  return Math.max(2, target.puzzlePassThreshold - 1)
}

// ── Age-adapted motivational messages ────────────────────────────────────

export function motivationalMessage(
  age: number | null,
  completionPercent: number,
  isComplete: boolean,
): string {
  const young = !age || age <= 9

  if (isComplete) {
    return young
      ? '🎉 Amazing! You finished all your training today!'
      : '✅ Daily target achieved — great consistency!'
  }

  if (completionPercent >= 60) {
    return young
      ? '🔥 So close! Just a little more!'
      : 'Almost there — finish strong!'
  }

  if (completionPercent >= 30) {
    return young
      ? '⭐ Good start! Keep going!'
      : 'Good progress — keep the momentum going.'
  }

  return young
    ? '🚀 Ready? Let\'s train!'
    : 'Start your daily training to build a winning habit.'
}
