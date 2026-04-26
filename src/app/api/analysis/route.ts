import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { pgnToMoveEvals } from '@/lib/chess/analysis'
import { runAnalysis } from '@/lib/chess/analysisEngine'
import { getStudentSkills } from '@/lib/skills/tracker'
import { masteryFromScore } from '@/lib/skills/scoring'
import { evalDrop } from '@/lib/chess/analysisEngine'
import type { MoveSummary } from '@/lib/ai/types'
import { getTodaysPlan, generatePlanFromDiagnostic } from '@/lib/training/dailyPlan'
import { SKILL_CATALOG } from '@/types/skills'
import type { ExplanationMode, GameMistake } from '@/types/database'
import type { SkillName } from '@/types/skills'
import type { DetectedMistake } from '@/lib/chess/analysisEngine'
import { z } from 'zod'

function toGameMistake(m: DetectedMistake): GameMistake {
  return {
    move_number: m.move_number,
    fen:         m.fen_after,
    move_san:    m.move,
    type:        m.severity,
    description: m.explanation,
  }
}

const AnalysisSchema = z.object({
  game_id:      z.string().uuid(),
  player_color: z.enum(['white', 'black']).default('white'),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = AnalysisSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { game_id, player_color } = parsed.data

  // Fetch game + student
  const { data: game } = await supabase
    .from('games')
    .select('*, students(*)')
    .eq('id', game_id)
    .single()

  if (!game) return NextResponse.json({ error: 'Game not found' }, { status: 404 })

  const student = game.students as {
    id: string; name: string; age: number
    explanation_mode: ExplanationMode; rating_band: string
  }

  if (!game.pgn) {
    return NextResponse.json({ error: 'Game has no PGN' }, { status: 400 })
  }

  // Fetch current skill scores so the engine can compute calibrated deltas
  const existingSkills = await getStudentSkills(supabase, student.id)
  const current_skill_scores: Partial<Record<SkillName, number>> = {}
  for (const s of existingSkills) {
    current_skill_scores[s.skill_name as SkillName] = s.score
  }

  // Build material-balance move evaluations from the PGN (no server-side Stockfish)
  const move_evals = pgnToMoveEvals(game.pgn)

  // Run full analysis: mistake detection → skill tagging → coaching → score updates
  const { mistakes, coaching, skill_updates } = runAnalysis({
    pgn:                  game.pgn,
    player_color,
    move_evals,
    current_skill_scores,
    explanation_mode:     student.explanation_mode,
  })

  const blunders     = mistakes.filter(m => m.severity === 'blunder')
  const non_blunders = mistakes.filter(m => m.severity !== 'blunder')
  const skill_tags   = [...new Set(mistakes.map(m => m.skill_tag))]

  // Per-move classification for the Moves tab
  const mistakeByPly = new Map(mistakes.map(m => [m.ply, m]))
  const moveList: MoveSummary[] = move_evals.map(ev => {
    const m = mistakeByPly.get(ev.ply)
    const drop = evalDrop(ev, player_color)
    const isStudentMove = (player_color === 'white' && ev.ply % 2 === 0) ||
                          (player_color === 'black'  && ev.ply % 2 === 1)
    return {
      ply:            ev.ply,
      move_number:    Math.floor(ev.ply / 2) + 1,
      san:            ev.san,
      color:          ev.ply % 2 === 0 ? 'white' : 'black',
      classification: (isStudentMove && m) ? m.severity : 'best',
      eval_drop:      isStudentMove ? Math.round(drop) : 0,
      description:    m?.explanation,
    }
  })

  // Build feedback directly from engine output — fully game-specific, no templates
  const enrichedFeedback = {
    quickSummary:  coaching.quick_summary,
    mainProblem:   coaching.key_mistake?.what_happened
                     ?? (mistakes.length === 0
                          ? 'No major errors — clean game.'
                          : 'Review the positions where material was left undefended.'),
    doneWell:      coaching.done_well,
    nextGameFocus: coaching.next_game_focus,
    trainingPlan:  coaching.training_plan,
    moveList,
  }

  const analysisPayload = {
    game_id,
    student_id:        student.id,
    mistakes:          non_blunders.map(toGameMistake),
    blunders:          blunders.map(toGameMistake),
    missed_tactics:    [],
    coaching_summary:  coaching.quick_summary,
    coaching_feedback: enrichedFeedback,
    skill_tags,
    overall_accuracy:  null,
  }

  // Persist analysis — update existing row or insert new one
  const { data: existingRow } = await supabase
    .from('game_analysis')
    .select('id')
    .eq('game_id', game_id)
    .single()

  const { data: analysis, error: saveError } = existingRow
    ? await supabase
        .from('game_analysis')
        .update(analysisPayload)
        .eq('game_id', game_id)
        .select()
        .single()
    : await supabase
        .from('game_analysis')
        .insert(analysisPayload)
        .select()
        .single()

  if (saveError) {
    console.error('[analysis] save error:', saveError.message)
  }

  // Apply precise per-skill score updates derived from the analysis
  for (const impact of skill_updates) {
    const skill = impact.skill as SkillName
    await supabase.from('skills').upsert(
      {
        student_id:    student.id,
        skill_name:    skill,
        category:      SKILL_CATALOG[skill].category,
        score:         impact.new_score,
        mastery_level: masteryFromScore(impact.new_score),
        last_updated:  new Date().toISOString(),
      },
      { onConflict: 'student_id,skill_name' }
    )

    await supabase.from('skill_events').insert({
      student_id: student.id,
      skill_name: skill,
      event_type: 'game_analysis',
      delta:      impact.delta,
      source_id:  game_id,
    })
  }

  // Generate today's training plan from this game if no active plan exists yet
  const existingPlan = await getTodaysPlan(supabase, student.id)
  if (!existingPlan || existingPlan.status === 'diagnostic_needed') {
    const updatedSkills = await getStudentSkills(supabase, student.id)
    await generatePlanFromDiagnostic(
      supabase, student.id, game_id, updatedSkills, skill_tags,
    ).catch(() => {})
  }

  return NextResponse.json({ analysis, feedback: enrichedFeedback, coaching })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const gameId = searchParams.get('game_id')
  if (!gameId) return NextResponse.json({ error: 'game_id required' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: analysis } = await supabase
    .from('game_analysis')
    .select('*')
    .eq('game_id', gameId)
    .single()

  return NextResponse.json({ analysis })
}
