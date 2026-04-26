// Auto-derivable from schema — keep in sync with 001_initial_schema.sql

import type { SkillName, SkillCategory } from './skills'
export type { SkillName, SkillCategory }

export type RatingBand = 'beginner' | '400-700' | '700-1000' | '1000-1300' | '1300+'
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced'
export type ExplanationMode = 'simple' | 'intermediate' | 'advanced'
export type GameResult = 'white_wins' | 'black_wins' | 'draw' | 'abandoned'
export type PlayerColor = 'white' | 'black'
export type OpponentStyle = 'balanced' | 'tactical' | 'positional' | 'defensive' | 'aggressive' | 'endgame' | 'blunder-friendly' | 'coach-mode'
export type MasteryLevel = 'learning' | 'developing' | 'proficient' | 'mastered'
export type SkillEventType = 'game_analysis' | 'puzzle_correct' | 'puzzle_incorrect' | 'lesson_complete'
export type ChatRole = 'user' | 'coach'
export type LessonContentType = 'text' | 'board' | 'quiz'
export type MistakeType = 'blunder' | 'mistake' | 'inaccuracy'

export interface Student {
  id: string
  user_id: string
  name: string
  age: number | null
  rating_band: RatingBand
  estimated_rating: number
  skill_level: SkillLevel
  explanation_mode: ExplanationMode
  parent_mode: boolean
  onboarding_done: boolean
  created_at: string
  updated_at: string
}

export interface Game {
  id: string
  student_id: string
  pgn: string | null
  fen_final: string | null
  result: GameResult | null
  player_color: PlayerColor
  opponent_style: OpponentStyle
  ai_level: number
  move_count: number
  duration_seconds: number | null
  created_at: string
}

export interface GameMistake {
  move_number: number
  fen: string
  move_san: string
  type: MistakeType
  description: string
}

export interface GameAnalysis {
  id: string
  game_id: string
  student_id: string
  mistakes: GameMistake[]
  blunders: GameMistake[]
  missed_tactics: GameMistake[]
  coaching_summary: string | null
  coaching_feedback: import('@/lib/ai/types').CoachingFeedback | null
  skill_tags: string[]
  overall_accuracy: number | null
  created_at: string
}

export interface Skill {
  id: string
  student_id: string
  skill_name: SkillName
  category: SkillCategory
  score: number
  mastery_level: MasteryLevel
  games_sampled: number
  puzzles_solved: number
  last_updated: string
}

export interface SkillEvent {
  id: string
  student_id: string
  skill_name: string
  event_type: SkillEventType
  delta: number
  source_id: string | null
  created_at: string
}

export interface Puzzle {
  id: string
  fen: string
  solution_moves: string[]
  theme: string
  difficulty: number
  rating: number | null
  hint: string | null
  explanation: string | null
  min_age: number
  created_at: string
}

export interface PuzzleAttempt {
  id: string
  student_id: string
  puzzle_id: string
  correct: boolean
  time_taken_seconds: number | null
  moves_tried: string[]
  hint_used: boolean
  created_at: string
}

export interface DemoStep {
  move?: string               // UCI e.g. "g1f3"
  san?: string                // display e.g. "Nf3"
  explanation: string
  highlights?: string[]       // squares to colour
  arrows?: [string, string, string?][]  // [from, to, colour?]
}

export interface LessonContent {
  type: LessonContentType
  body: string
  fen?: string
  steps?: DemoStep[]          // board demo steps
  tip?: string
  quiz?: {
    question: string
    options: string[]
    correct_index: number
  }
}

export interface Lesson {
  id: string
  title: string
  theme: string
  skill_name: string
  difficulty: number
  content: LessonContent
  min_age: number
  max_age: number
  order_index: number
  created_at: string
}

export interface LessonProgress {
  id: string
  student_id: string
  lesson_id: string
  completed: boolean
  score: number | null
  completed_at: string | null
  created_at: string
}

export interface CoachInteraction {
  id: string
  student_id: string
  game_id: string | null
  role: ChatRole
  content: string
  context: Record<string, unknown>
  created_at: string
}
