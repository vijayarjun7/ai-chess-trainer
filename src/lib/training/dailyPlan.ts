import type { SupabaseClient } from '@supabase/supabase-js'
import type { Skill } from '@/types/database'
import type { SkillName } from '@/types/skills'
import type {
  DailyPlan,
  DailyPlanRow,
  DailyPlanStatus,
  DailyTarget,
  TargetPriority,
} from '@/types/training'
import { SKILL_CATALOG } from '@/types/skills'
import { TRAINER_LESSON_MAP } from '@/lib/lessons/trainerLessons'

// ── Helpers ───────────────────────────────────────────────────────────────

export function todayString(): string {
  return new Date().toISOString().split('T')[0]
}

function rowToPlan(row: DailyPlanRow): DailyPlan {
  return {
    id:                row.id,
    studentId:         row.student_id,
    date:              row.date,
    diagnosticGameId:  row.diagnostic_game_id,
    primaryWeakness:   row.primary_weakness   as SkillName | null,
    secondaryWeakness: row.secondary_weakness as SkillName | null,
    strongestSkill:    row.strongest_skill    as SkillName | null,
    targets:           row.targets ?? [],
    status:            row.status,
    completedAt:       row.completed_at,
    createdAt:         row.created_at,
    updatedAt:         row.updated_at,
  }
}

// ── Target builder ────────────────────────────────────────────────────────

function buildTargetsFromSkills(skills: Skill[]): DailyTarget[] {
  const sorted   = [...skills].sort((a, b) => a.score - b.score)
  // Cap at 3; always include primary — add secondary/bonus only if score < 65
  const eligible = sorted.filter((s, i) => i === 0 || s.score < 65)
  const capped   = eligible.slice(0, 3)

  const priorities: TargetPriority[] = ['primary', 'secondary', 'bonus']

  return capped.map((skill, i) => {
    const skillName    = skill.skill_name as SkillName
    const lessonExists = Object.prototype.hasOwnProperty.call(TRAINER_LESSON_MAP, skillName)

    return {
      id:                  crypto.randomUUID(),
      skill:               skillName,
      skillLabel:          SKILL_CATALOG[skillName]?.label ?? skillName,
      priority:            priorities[i],
      skillScoreAtStart:   skill.score,
      lessonTheme:         lessonExists ? skillName : null,
      puzzleTarget:        5,
      puzzlePassThreshold: 3,
      focusedGameRequired: i === 0, // only primary needs a follow-up game
    }
  })
}

// ── Read ──────────────────────────────────────────────────────────────────

export async function getTodaysPlan(
  supabase: SupabaseClient,
  studentId: string,
): Promise<DailyPlan | null> {
  const { data } = await supabase
    .from('daily_plans')
    .select('*')
    .eq('student_id', studentId)
    .eq('date', todayString())
    .maybeSingle()

  return data ? rowToPlan(data as DailyPlanRow) : null
}

// Returns today's plan, creating a diagnostic_needed shell if none exists yet.
export async function ensureTodaysPlan(
  supabase: SupabaseClient,
  studentId: string,
): Promise<DailyPlan> {
  const existing = await getTodaysPlan(supabase, studentId)
  if (existing) return existing

  const { data, error } = await supabase
    .from('daily_plans')
    .insert({
      student_id: studentId,
      date:       todayString(),
      status:     'diagnostic_needed' satisfies DailyPlanStatus,
      targets:    [],
    })
    .select()
    .single()

  if (error || !data) throw new Error(`Failed to create daily plan: ${error?.message}`)
  return rowToPlan(data as DailyPlanRow)
}

// ── Generate ──────────────────────────────────────────────────────────────

/**
 * Called after the first game of the day is analysed.
 * Builds a targeted 3-item training plan from the updated skill profile.
 * Uses upsert so it is safe to call twice (e.g. page reload).
 */
export async function generatePlanFromDiagnostic(
  supabase: SupabaseClient,
  studentId: string,
  diagnosticGameId: string,
  skills: Skill[],
  skillTagsFromGame: string[],
): Promise<DailyPlan> {
  // Sort ascending (weakest first), descending for strongest
  const ascending  = [...skills].sort((a, b) => a.score - b.score)
  const descending = [...skills].sort((a, b) => b.score - a.score)

  // Prioritise skills actually exposed during the diagnostic game
  const gameTouched = ascending.filter(s => skillTagsFromGame.includes(s.skill_name))
  const primary     = gameTouched[0] ?? ascending[0]
  const secondary   = ascending.find(s => s.skill_name !== primary?.skill_name)
  const strongest   = descending[0]

  const targets = buildTargetsFromSkills(ascending)

  const { data, error } = await supabase
    .from('daily_plans')
    .upsert(
      {
        student_id:         studentId,
        date:               todayString(),
        diagnostic_game_id: diagnosticGameId,
        primary_weakness:   primary?.skill_name   ?? null,
        secondary_weakness: secondary?.skill_name ?? null,
        strongest_skill:    strongest?.skill_name ?? null,
        targets,
        status:             'in_progress' satisfies DailyPlanStatus,
        updated_at:         new Date().toISOString(),
      },
      { onConflict: 'student_id,date' },
    )
    .select()
    .single()

  if (error || !data) throw new Error(`Failed to generate daily plan: ${error?.message}`)
  return rowToPlan(data as DailyPlanRow)
}

// ── Update status ─────────────────────────────────────────────────────────

export async function markPlanCompleted(
  supabase: SupabaseClient,
  planId: string,
): Promise<void> {
  await supabase
    .from('daily_plans')
    .update({
      status:       'completed' satisfies DailyPlanStatus,
      completed_at: new Date().toISOString(),
    })
    .eq('id', planId)
}

export async function markPlanRepeatNeeded(
  supabase: SupabaseClient,
  planId: string,
): Promise<void> {
  await supabase
    .from('daily_plans')
    .update({ status: 'repeat_needed' satisfies DailyPlanStatus })
    .eq('id', planId)
}
