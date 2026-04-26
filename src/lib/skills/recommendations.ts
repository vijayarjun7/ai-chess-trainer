import type { Skill } from '@/types/database'
import type { SkillName, AdaptiveRecommendation } from '@/types/skills'
import { SKILL_CATALOG } from '@/types/skills'

// Core adaptive logic:
// 1. Rating band sets baseline puzzle difficulty
// 2. Weakest skill determines training priority
// 3. Difficulty adapts by current skill score, not just rating
export function generateRecommendations(
  skills: Skill[],
  ratingBand: string,
  age: number | null
): AdaptiveRecommendation[] {
  const sorted = [...skills].sort((a, b) => a.score - b.score)
  const recommendations: AdaptiveRecommendation[] = []

  // Top-priority: weakest skill with score < 60
  const weakSkills = sorted.filter(s => s.score < 60)
  for (const skill of weakSkills.slice(0, 2)) {
    recommendations.push({
      priority: skill.score < 40 ? 'high' : 'medium',
      type: 'puzzle',
      skill_name: skill.skill_name as SkillName,
      label: SKILL_CATALOG[skill.skill_name as SkillName]?.label ?? skill.skill_name,
      reason: skill.score < 40
        ? `Your ${SKILL_CATALOG[skill.skill_name as SkillName]?.label} score is very low — targeted puzzles will help most.`
        : `You can improve your ${SKILL_CATALOG[skill.skill_name as SkillName]?.label} with more practice.`,
    })
  }

  // Lesson recommendation for lowest-scored skill
  if (weakSkills.length > 0) {
    const target = weakSkills[0]
    recommendations.push({
      priority: 'medium',
      type: 'lesson',
      skill_name: target.skill_name as SkillName,
      label: SKILL_CATALOG[target.skill_name as SkillName]?.label ?? target.skill_name,
      reason: `Review the lesson on ${SKILL_CATALOG[target.skill_name as SkillName]?.label} to strengthen your understanding.`,
    })
  }

  // Game focus recommendation
  if (sorted.length > 0) {
    const focus = sorted[0]
    recommendations.push({
      priority: 'low',
      type: 'game_focus',
      skill_name: focus.skill_name as SkillName,
      label: SKILL_CATALOG[focus.skill_name as SkillName]?.label ?? focus.skill_name,
      reason: `During your next game, pay extra attention to ${SKILL_CATALOG[focus.skill_name as SkillName]?.label}.`,
    })
  }

  return recommendations
}

// Returns the difficulty level (1–10) for puzzles given a skill score and rating band
export function adaptivePuzzleDifficulty(skillScore: number, ratingBand: string): number {
  const baseByRating: Record<string, number> = {
    'beginner':  1,
    '400-700':   2,
    '700-1000':  4,
    '1000-1300': 6,
    '1300+':     8,
  }

  const base = baseByRating[ratingBand] ?? 2

  // Skill score adjusts up/down from baseline
  const skillAdjust = Math.round((skillScore - 50) / 20)  // -2 to +2.5
  return Math.max(1, Math.min(10, base + skillAdjust))
}

// Select the weakest skill to focus on for next session
export function getPrimaryFocusSkill(skills: Skill[]): SkillName | null {
  if (skills.length === 0) return null
  const sorted = [...skills].sort((a, b) => a.score - b.score)
  return sorted[0].skill_name as SkillName
}
