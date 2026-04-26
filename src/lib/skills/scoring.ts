import type { MasteryLevel } from '@/types/database'
import type { SkillName } from '@/types/skills'
import { SCORE_TO_MASTERY } from '@/types/skills'

// How much each event type shifts the skill score (before clamping to 0–100)
const EVENT_DELTAS: Record<string, number> = {
  blunder_in_game:     -8,
  mistake_in_game:     -4,
  inaccuracy_in_game:  -1,
  clean_game:          +5,
  puzzle_correct:      +6,
  puzzle_incorrect:    -3,
  puzzle_hint_used:    +2,   // partial credit
  lesson_complete:     +3,
}

export function scoreForPuzzleAttempt(
  correct: boolean,
  hintUsed: boolean,
  _timeTakenSeconds: number | null
): number {
  if (correct && !hintUsed) return EVENT_DELTAS.puzzle_correct
  if (correct && hintUsed)  return EVENT_DELTAS.puzzle_hint_used
  return EVENT_DELTAS.puzzle_incorrect
}

export function scoreForGameAnalysis(
  skillName: SkillName,
  skillTags: string[],
  blunderCount: number,
  mistakeCount: number
): number {
  if (!skillTags.includes(skillName)) {
    // Skill was not part of the game's tagged issues — small passive gain
    return blunderCount === 0 && mistakeCount === 0 ? +2 : 0
  }

  let delta = 0
  delta += blunderCount * EVENT_DELTAS.blunder_in_game
  delta += mistakeCount * EVENT_DELTAS.mistake_in_game
  return Math.max(-20, delta) // cap the penalty per game
}

export function clampScore(current: number, delta: number): number {
  return Math.max(0, Math.min(100, current + delta))
}

export function masteryFromScore(score: number): MasteryLevel {
  return SCORE_TO_MASTERY(score)
}

// Weighted moving average so early games don't dominate forever
export function updateSkillScore(
  currentScore: number,
  delta: number,
  gamesSampled: number
): number {
  const weight = Math.min(1, 10 / (gamesSampled + 10))  // tapers off as more data accumulates
  const weightedDelta = delta * weight
  return clampScore(currentScore, weightedDelta)
}
