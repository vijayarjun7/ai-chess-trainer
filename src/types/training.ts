import type { SkillName } from '@/types/skills'

// ── Status ─────────────────────────────────────────────────────���───────────

export type DailyPlanStatus =
  | 'diagnostic_needed'   // no diagnostic game played today yet
  | 'in_progress'         // plan generated, primary target not yet complete
  | 'completed'           // primary target achieved
  | 'repeat_needed'       // previous day target not met — repeat with lower difficulty

export type TargetPriority = 'primary' | 'secondary' | 'bonus'

// ── Stored types (persisted in daily_plans.targets JSONB) ──────────────────

export interface DailyTarget {
  id: string                    // client UUID
  skill: SkillName
  skillLabel: string
  priority: TargetPriority
  skillScoreAtStart: number     // baseline score when target was created (0-100)
  lessonTheme: string | null    // maps to TRAINER_LESSON_MAP key; null if no lesson available
  puzzleTarget: number          // puzzles to solve (default 5)
  puzzlePassThreshold: number   // min correct puzzles to "pass" this target (default 3)
  focusedGameRequired: boolean  // only primary target requires a follow-up game
}

export interface DailyPlan {
  id: string
  studentId: string
  date: string                  // YYYY-MM-DD
  diagnosticGameId: string | null
  primaryWeakness: SkillName | null
  secondaryWeakness: SkillName | null
  strongestSkill: SkillName | null
  targets: DailyTarget[]        // max 3, ordered by priority
  status: DailyPlanStatus
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

// ── Computed progress (evaluated live, never persisted) ────────────────────

export interface TargetProgress {
  targetId: string
  skill: SkillName
  skillLabel: string
  priority: TargetPriority
  lessonCompleted: boolean
  puzzlesAttempted: number
  puzzlesCorrect: number
  puzzleAccuracy: number        // 0-100
  gamesPlayedToday: number
  isComplete: boolean
  activitiesRemaining: string[] // human-readable list, age-adapted
}

export interface DailyPlanWithProgress {
  plan: DailyPlan
  progress: TargetProgress[]
  overallComplete: boolean
  completionPercent: number     // 0-100 for the primary target
  nextRecommendation: string | null
}

// ── Row shape from Supabase (snake_case) ────────────────────────────────���─

export interface DailyPlanRow {
  id: string
  student_id: string
  date: string
  diagnostic_game_id: string | null
  primary_weakness: string | null
  secondary_weakness: string | null
  strongest_skill: string | null
  targets: DailyTarget[]
  status: DailyPlanStatus
  completed_at: string | null
  created_at: string
  updated_at: string
}
