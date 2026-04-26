import { Chess } from 'chess.js'
import type { Square, Color } from 'chess.js'
import type { GameAnalysis, GameMistake } from '@/types/database'
import type { SkillName } from '@/types/skills'
import type { MoveEval } from './analysisEngine'

// Threshold in centipawns for classifying moves
const THRESHOLDS = {
  blunder:    -300,
  mistake:    -150,
  inaccuracy:  -75,
}

export interface RawMoveEval {
  move_number: number
  san: string
  fen_before: string
  fen_after: string
  eval_before: number
  eval_after: number
  eval_drop: number  // negative = player lost advantage
}

// Classify a single move based on evaluation drop (from player's perspective)
function classifyMove(drop: number): GameMistake['type'] | 'best' {
  if (drop <= THRESHOLDS.blunder)    return 'blunder'
  if (drop <= THRESHOLDS.mistake)    return 'mistake'
  if (drop <= THRESHOLDS.inaccuracy) return 'inaccuracy'
  return 'best'
}

// Infer skill tags from the pattern of mistakes in the game
export function inferSkillTags(mistakes: GameMistake[]): SkillName[] {
  const counts: Partial<Record<SkillName, number>> = {}

  for (const m of mistakes) {
    const desc = m.description.toLowerCase()
    const found = descriptionToSkill(desc)
    if (found) counts[found] = (counts[found] ?? 0) + 1
  }

  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .map(([k]) => k as SkillName)
}

function descriptionToSkill(desc: string): SkillName | null {
  if (desc.includes('hanging') || desc.includes('left undefended')) return 'hanging_pieces'
  if (desc.includes('fork'))     return 'forks'
  if (desc.includes('pin'))      return 'pins'
  if (desc.includes('skewer'))   return 'skewers'
  if (desc.includes('checkmate') || desc.includes('mate')) return 'checkmate_patterns'
  if (desc.includes('king'))     return 'king_safety'
  if (desc.includes('develop'))  return 'development'
  if (desc.includes('threat'))   return 'threat_awareness'
  return null
}

// Build analysis from server-side evaluations (called in API route)
export function buildAnalysisFromEvals(
  pgn: string,
  evals: number[], // centipawn evals per half-move, length = total plies
  studentColor: 'white' | 'black'
): Pick<GameAnalysis, 'mistakes' | 'blunders' | 'missed_tactics' | 'skill_tags' | 'overall_accuracy'> {
  const chess = new Chess()
  chess.loadPgn(pgn)

  const history = chess.history({ verbose: true })
  const mistakes: GameMistake[] = []
  const blunders: GameMistake[] = []
  const missed_tactics: GameMistake[] = []

  let accuracy_sum = 0
  let student_moves = 0

  for (let i = 0; i < history.length; i++) {
    const move = history[i]
    const isStudentMove =
      (studentColor === 'white' && i % 2 === 0) ||
      (studentColor === 'black' && i % 2 === 1)

    if (!isStudentMove) continue

    const evalBefore = evals[i] ?? 0
    const evalAfter  = evals[i + 1] ?? 0

    // flip sign for black (evals are always from white's perspective)
    const drop = studentColor === 'white'
      ? (evalAfter - evalBefore)
      : (evalBefore - evalAfter)

    student_moves++

    // Rough accuracy: 100 if best, drops proportionally
    const moveAccuracy = Math.max(0, 100 + (drop / 10))
    accuracy_sum += Math.min(100, moveAccuracy)

    const classification = classifyMove(drop)
    if (classification === 'best') continue

    const mistake: GameMistake = {
      move_number: Math.floor(i / 2) + 1,
      fen: move.before,
      move_san: move.san,
      type: classification as GameMistake['type'],
      description: generateMistakeDescription(move.san, classification as string, drop),
    }

    if (classification === 'blunder') blunders.push(mistake)
    else mistakes.push(mistake)
  }

  const all_mistakes = [...blunders, ...mistakes]
  const skill_tags = inferSkillTags(all_mistakes) as unknown as string[]
  const overall_accuracy = student_moves > 0
    ? parseFloat((accuracy_sum / student_moves).toFixed(2))
    : null

  return { mistakes, blunders, missed_tactics, skill_tags, overall_accuracy }
}

function generateMistakeDescription(san: string, type: string, drop: number): string {
  const descriptions: Record<string, string[]> = {
    blunder: [
      `Playing ${san} left a piece hanging — your opponent can take it for free.`,
      `${san} dropped a big advantage. Look for pieces left undefended before moving.`,
      `This blunder with ${san} allowed the opponent a decisive tactic.`,
    ],
    mistake: [
      `${san} was a mistake. A better move would have kept more control of the position.`,
      `After ${san}, your opponent gained a clear advantage. Watch for threats first.`,
    ],
    inaccuracy: [
      `${san} was slightly imprecise. There was a stronger option available.`,
      `A small inaccuracy with ${san} — not a disaster, but worth reviewing.`,
    ],
  }

  const pool = descriptions[type] ?? descriptions['inaccuracy']
  return pool[Math.abs(Math.round(drop)) % pool.length]
}

// ─── Position evaluator (material + hanging-piece penalty) ───────────────────

const MATERIAL_VALUE: Record<string, number> = {
  p: 100, n: 320, b: 330, r: 500, q: 900, k: 0,
}

// Material balance + 80% penalty for each undefended piece that is attacked.
// A hanging queen → ~720 cp drop; hanging knight → ~256 cp drop.
// This allows pgnToMoveEvals to detect positional mistakes, not just captures.
function positionEval(fen: string): number {
  const chess = new Chess(fen)
  let score = 0
  for (const row of chess.board()) {
    for (const cell of row) {
      if (!cell) continue
      const v      = MATERIAL_VALUE[cell.type] ?? 0
      const sign   = cell.color === 'w' ? 1 : -1
      const sq     = cell.square as Square
      const enemy  = (cell.color === 'w' ? 'b' : 'w') as Color
      const friend = cell.color as Color
      score += sign * v
      if (
        chess.attackers(sq, enemy).length > 0 &&
        chess.attackers(sq, friend).length === 0
      ) {
        score -= sign * v * 0.8
      }
    }
  }
  return score
}

/**
 * Replay a PGN and produce position evaluations for every half-move.
 * Uses material balance + hanging-piece penalties so mistakes (not just
 * blunders from direct captures) are detectable by buildAnalysisFromEvals.
 */
export function pgnToMoveEvals(pgn: string): MoveEval[] {
  const chess = new Chess()
  chess.loadPgn(pgn)
  const history = chess.history({ verbose: true })

  return history.map((move, i) => ({
    ply:         i,
    san:         move.san,
    uci:         move.from + move.to + (move.promotion ?? ''),
    fen_before:  move.before,
    fen_after:   move.after,
    eval_before: positionEval(move.before),
    eval_after:  positionEval(move.after),
  }))
}

// Simple heuristic analysis when no engine is available (stub/mock path)
export function heuristicAnalysis(
  pgn: string,
  studentColor: 'white' | 'black'
): Pick<GameAnalysis, 'mistakes' | 'blunders' | 'missed_tactics' | 'skill_tags' | 'overall_accuracy'> {
  const chess = new Chess()
  chess.loadPgn(pgn)
  const history = chess.history({ verbose: true })

  const mistakes: GameMistake[] = []
  const blunders: GameMistake[] = []
  const tempChess = new Chess()

  for (let i = 0; i < history.length; i++) {
    const move = history[i]
    const isStudentMove =
      (studentColor === 'white' && i % 2 === 0) ||
      (studentColor === 'black' && i % 2 === 1)

    if (!isStudentMove) { tempChess.move(move.san); continue }

    tempChess.move(move.san)

    const attackers = tempChess.isAttacked(move.to, tempChess.turn())
    const defenders = tempChess.isAttacked(move.to, move.color)

    if (attackers && !defenders) {
      blunders.push({
        move_number: Math.floor(i / 2) + 1,
        fen: move.before,
        move_san: move.san,
        type: 'blunder',
        description: `Playing ${move.san} left a piece hanging — your opponent can take it for free.`,
      })
    }
  }

  return {
    mistakes,
    blunders,
    missed_tactics: [],
    skill_tags: blunders.length > 0 ? ['hanging_pieces'] : [],
    overall_accuracy: null,
  }
}
