import type { OpponentStyle, PlayerColor } from './database'
import type { SkillName } from './skills'

export interface ChessMove {
  from: string
  to: string
  promotion?: string
  san?: string
  fen_after?: string
}

// Per-axis style multipliers applied during move scoring.
// Values > 1 boost that move type; < 1 suppress it.
export interface OpponentStyleBias {
  preferCaptures:       number
  preferChecks:         number
  preferPawnMoves:      number
  preferDevelopment:    number
  preferKingAttack:     number
  preferSimplification: number
  preferPassivity:      number
}

// Full configuration that drives opponent behaviour for one game.
export interface OpponentConfig {
  targetStrength:         number          // 1–10 (displayed in UI)
  engineDepth:            number          // Stockfish search depth
  candidateMovePoolSize:  number          // MultiPV N — how many moves to evaluate
  randomness:             number          // 0–1: entropy injected into move selection
  mistakeRate:            number          // 0–1: probability of choosing a weak move
  styleBias:              OpponentStyleBias
  allowTrainingOpportunities: boolean
  trainingSkill:          SkillName | null  // today's target — tilts opponent behaviour
}

export interface GameConfig {
  playerColor:        PlayerColor
  aiLevel:            number          // 1–10 display value
  opponentStyle:      OpponentStyle
  opponentConfig:     OpponentConfig  // always set; derived from student profile + style
  timeControlMinutes: number | null   // null = no clock
}

export interface EngineEval {
  score:     number    // centipawns, positive = white advantage
  depth:     number
  best_move: string    // UCI
  pv?:       string[]
}

export type OpponentPersonality = {
  style:       OpponentStyle
  description: string
  tendencies:  string[]
  skillBias:   Record<string, number>
}

export const OPPONENT_PERSONALITIES: Record<OpponentStyle, OpponentPersonality> = {
  balanced: {
    style: 'balanced',
    description: 'Plays solid, well-rounded chess',
    tendencies: ['controls center', 'develops pieces', 'looks for tactics'],
    skillBias: {},
  },
  tactical: {
    style: 'tactical',
    description: 'Loves complications and attacks',
    tendencies: ['sacrifices material', 'opens files', 'creates threats constantly'],
    skillBias: { tactics: 1.3 },
  },
  positional: {
    style: 'positional',
    description: 'Focuses on long-term advantages',
    tendencies: ['controls outposts', 'improves piece placement', 'restricts opponent'],
    skillBias: { strategy: 1.3 },
  },
  defensive: {
    style: 'defensive',
    description: 'Waits for mistakes and counterattacks',
    tendencies: ['consolidates', 'avoids complications', 'trades to simplify'],
    skillBias: {},
  },
  aggressive: {
    style: 'aggressive',
    description: 'Attacks the king early and relentlessly',
    tendencies: ['launches kingside attacks', 'sacrifices for initiative', 'avoids trades'],
    skillBias: { king_attack: 1.4 },
  },
  endgame: {
    style: 'endgame',
    description: 'Simplifies into favorable endgames',
    tendencies: ['trades pieces', 'activates king', 'creates passed pawns'],
    skillBias: { endgame: 1.3 },
  },
  'blunder-friendly': {
    style: 'blunder-friendly',
    description: 'Makes frequent mistakes — great for beginners',
    tendencies: ['leaves pieces hanging', 'misses threats', 'allows comebacks'],
    skillBias: {},
  },
  'coach-mode': {
    style: 'coach-mode',
    description: "Creates learning opportunities tied to today's training goal",
    tendencies: ['sets up training patterns', 'repeats missed themes', 'varies difficulty'],
    skillBias: {},
  },
}

export interface AnalyzedPosition {
  fen:            string
  move_san:       string
  move_number:    number
  eval_before:    number
  eval_after:     number
  eval_drop:      number
  classification: 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder'
}
