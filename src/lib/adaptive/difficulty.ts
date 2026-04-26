import type { Student } from '@/types/database'
import type { Skill } from '@/types/database'

// AI level 1–10 adapted from both rating band AND skill profile
export function adaptiveAiLevel(student: Student, skills: Skill[]): number {
  const baseByRating: Record<string, number> = {
    beginner:    2,
    '400-700':   3,
    '700-1000':  5,
    '1000-1300': 7,
    '1300+':     9,
  }

  const base = baseByRating[student.rating_band] ?? 3

  // Compute average skill score
  const avgSkill = skills.length > 0
    ? skills.reduce((sum, s) => sum + s.score, 0) / skills.length
    : 50

  // Slightly adjust: high skill → harder opponent, low skill → softer
  const skillAdjust = Math.round((avgSkill - 50) / 25)

  return Math.max(1, Math.min(10, base + skillAdjust))
}

// Returns the explanation complexity level based on age
export function explanationModeFromAge(age: number | null): 'simple' | 'intermediate' | 'advanced' {
  if (!age || age <= 8)  return 'simple'
  if (age <= 12)         return 'intermediate'
  return 'advanced'
}

// Sentence starters / tone for each explanation mode
export const EXPLANATION_TONE = {
  simple: {
    intro:   'Good try! Here is what happened:',
    mistake: 'You left a piece alone! Try to protect all your pieces.',
    praise:  'Great move! You did that perfectly.',
  },
  intermediate: {
    intro:   "Let's look at your game:",
    mistake: 'This move left a piece hanging. Always check if pieces are defended.',
    praise:  'Nice play! You spotted the tactic correctly.',
  },
  advanced: {
    intro:   "Here's your game analysis:",
    mistake: 'This move dropped material. Consider piece safety before committal moves.',
    praise:  "Strong move — you correctly identified the winning continuation.",
  },
}

// FUTURE HOOK: quantum-inspired curriculum optimizer placeholder
// Replace this stub with a real optimization pass later.
export interface CurriculumNode {
  skill_name: string
  difficulty: number
  estimated_gain: number
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function quantumCurriculumHook(_nodes: CurriculumNode[]): CurriculumNode[] {
  // STUB: quantum-inspired ordering will go here
  // For now, sort by estimated_gain descending
  return [..._nodes].sort((a, b) => b.estimated_gain - a.estimated_gain)
}
