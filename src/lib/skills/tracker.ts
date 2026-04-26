import type { SupabaseClient } from '@supabase/supabase-js'
import type { SkillName } from '@/types/skills'
import type { Skill, SkillEventType } from '@/types/database'
import { SKILL_CATALOG } from '@/types/skills'
import { updateSkillScore, masteryFromScore, scoreForPuzzleAttempt, scoreForGameAnalysis } from './scoring'

// Upsert a skill record (creates it if it doesn't exist)
async function upsertSkill(
  supabase: SupabaseClient,
  studentId: string,
  skillName: SkillName,
  newScore: number,
  increment: { games?: number; puzzles?: number }
): Promise<void> {
  const mastery = masteryFromScore(newScore)
  const { category } = SKILL_CATALOG[skillName]

  await supabase.from('skills').upsert(
    {
      student_id:     studentId,
      skill_name:     skillName,
      category,
      score:          newScore,
      mastery_level:  mastery,
      last_updated:   new Date().toISOString(),
      ...(increment.games   ? { games_sampled:  supabase.rpc('increment', { table: 'skills', column: 'games_sampled', amount: 1 }) } : {}),
      ...(increment.puzzles ? { puzzles_solved:  supabase.rpc('increment', { table: 'skills', column: 'puzzles_solved', amount: 1 }) } : {}),
    },
    { onConflict: 'student_id,skill_name' }
  )
}

async function logSkillEvent(
  supabase: SupabaseClient,
  studentId: string,
  skillName: string,
  eventType: SkillEventType,
  delta: number,
  sourceId?: string
): Promise<void> {
  await supabase.from('skill_events').insert({
    student_id: studentId,
    skill_name: skillName,
    event_type: eventType,
    delta,
    source_id:  sourceId ?? null,
  })
}

// Fetch current skill scores for a student
export async function getStudentSkills(
  supabase: SupabaseClient,
  studentId: string
): Promise<Skill[]> {
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .eq('student_id', studentId)
    .order('score', { ascending: true })

  if (error) throw error
  return data ?? []
}

// Update skills after a completed game analysis
export async function applyGameAnalysisToSkills(
  supabase: SupabaseClient,
  studentId: string,
  gameId: string,
  skillTags: string[],
  blunderCount: number,
  mistakeCount: number
): Promise<void> {
  // Fetch existing skills to get current scores
  const existing = await getStudentSkills(supabase, studentId)
  const scoreMap = new Map(existing.map(s => [s.skill_name, s]))

  // Update each tracked skill
  for (const skillName of Object.keys(SKILL_CATALOG) as SkillName[]) {
    const current = scoreMap.get(skillName)
    const currentScore = current?.score ?? 50
    const gamesSampled = current?.games_sampled ?? 0

    const delta = scoreForGameAnalysis(skillName, skillTags, blunderCount, mistakeCount)
    if (delta === 0) continue

    const newScore = updateSkillScore(currentScore, delta, gamesSampled)

    await supabase.from('skills').upsert(
      {
        student_id:    studentId,
        skill_name:    skillName,
        category:      SKILL_CATALOG[skillName].category,
        score:         newScore,
        mastery_level: masteryFromScore(newScore),
        games_sampled: (gamesSampled + 1),
        last_updated:  new Date().toISOString(),
      },
      { onConflict: 'student_id,skill_name' }
    )

    await logSkillEvent(supabase, studentId, skillName, 'game_analysis', delta, gameId)
  }
}

// Update skills after a puzzle attempt
export async function applyPuzzleAttemptToSkills(
  supabase: SupabaseClient,
  studentId: string,
  attemptId: string,
  skillName: SkillName,
  correct: boolean,
  hintUsed: boolean,
  timeTaken: number | null
): Promise<void> {
  const { data: existing } = await supabase
    .from('skills')
    .select('score, puzzles_solved')
    .eq('student_id', studentId)
    .eq('skill_name', skillName)
    .single()

  const currentScore   = existing?.score        ?? 50
  const puzzlesSolved  = existing?.puzzles_solved ?? 0
  const delta          = scoreForPuzzleAttempt(correct, hintUsed, timeTaken)
  const newScore       = updateSkillScore(currentScore, delta, puzzlesSolved)

  await supabase.from('skills').upsert(
    {
      student_id:     studentId,
      skill_name:     skillName,
      category:       SKILL_CATALOG[skillName].category,
      score:          newScore,
      mastery_level:  masteryFromScore(newScore),
      puzzles_solved: puzzlesSolved + (correct ? 1 : 0),
      last_updated:   new Date().toISOString(),
    },
    { onConflict: 'student_id,skill_name' }
  )

  const eventType: SkillEventType = correct ? 'puzzle_correct' : 'puzzle_incorrect'
  await logSkillEvent(supabase, studentId, skillName, eventType, delta, attemptId)
}

// Initialize all skills for a new student at 50
export async function initializeStudentSkills(
  supabase: SupabaseClient,
  studentId: string
): Promise<void> {
  const rows = (Object.entries(SKILL_CATALOG) as [SkillName, typeof SKILL_CATALOG[SkillName]][]).map(
    ([skillName, meta]) => ({
      student_id:    studentId,
      skill_name:    skillName,
      category:      meta.category,
      score:         50,
      mastery_level: 'learning' as const,
      games_sampled: 0,
      puzzles_solved: 0,
    })
  )

  await supabase.from('skills').upsert(rows, { onConflict: 'student_id,skill_name' })
}
