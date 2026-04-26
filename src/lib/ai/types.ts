import type { ExplanationMode } from '@/types/database'

export interface CoachContext {
  studentName: string
  age: number | null
  explanationMode: ExplanationMode
  ratingBand: string
  skillTags: string[]
  recentMistakes: string[]
  gameResult: string | null
}

export interface MoveSummary {
  ply: number
  move_number: number
  san: string
  color: 'white' | 'black'
  classification: 'best' | 'inaccuracy' | 'mistake' | 'blunder'
  eval_drop: number
  description?: string
}

export interface CoachingFeedback {
  quickSummary: string
  mainProblem: string
  doneWell: string
  nextGameFocus: string
  trainingPlan: string[]
  assumptionsNote?: string
  moveList?: MoveSummary[]
}

export interface ChatMessage {
  role: 'user' | 'coach'
  content: string
}

export interface CoachChatResponse {
  reply: string
}
