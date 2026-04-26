export interface TrainerArrow {
  from: string
  to: string
  color?: string
}

export interface TrainerLessonStep {
  id: string
  title: string
  fen: string
  explanation: string
  coachSpeech: string
  highlights: string[]
  arrows: TrainerArrow[]
  moveToPlay?: string
  question?: string
  expectedAnswer?: string
}

export interface TrainerPuzzle {
  id: string
  fen: string
  solutionMoves: string[]   // UCI e.g. ["e2e4", "e7e5"]
  playerColor: 'white' | 'black'
  hint?: string
  explanation: string
}

export interface TrainerLesson {
  id: string
  title: string
  theme: string
  description: string
  steps: TrainerLessonStep[]
  puzzles: TrainerPuzzle[]
}

export type TrainerPhase = 'lesson' | 'puzzles' | 'done'

export interface PuzzleResult {
  puzzleId: string
  correct: boolean
  hintUsed: boolean
  timeTaken: number
}
