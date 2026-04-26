/**
 * AI Chess Trainer — Core Analysis Engine
 *
 * Responsibilities:
 *   1. Classify mistakes from engine evaluations
 *   2. Map each mistake to a skill category via board inspection
 *   3. Root-cause analysis from position geometry
 *   4. Age-adaptive coaching output generation
 *   5. Skill score updates with diminishing-return weighting
 */

import { Chess, type Square, type Color } from 'chess.js'
import type { ExplanationMode } from '@/types/database'
import type { SkillName } from '@/types/skills'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface MoveEval {
  ply: number          // 0-based half-move index (ply 0 = white's first move)
  san: string          // e.g. "Nf3"
  uci: string          // e.g. "g1f3"
  fen_before: string   // position before this move
  fen_after: string    // position after this move
  eval_before: number  // centipawns, white-positive
  eval_after: number   // centipawns, white-positive
}

export type Severity = 'blunder' | 'mistake' | 'inaccuracy'

export interface DetectedMistake {
  move_number: number   // full move number (ceil(ply/2) + 1 for white, ply/2+1 for black)
  ply: number
  move: string          // SAN
  fen_before: string
  fen_after: string
  eval_before: number
  eval_after: number
  eval_drop: number     // centipawns lost from player's perspective (always positive)
  severity: Severity
  skill_tag: SkillName
  root_cause: string    // one-line technical summary
  explanation: string   // child-friendly sentence
}

export interface CoachingOutput {
  quick_summary: string
  key_mistake: {
    move_number: number
    move: string
    what_happened: string
    why_wrong: string
  } | null
  done_well: string
  next_game_focus: string
  training_plan: string[]
  skill_impact: SkillImpact[]
}

export interface SkillImpact {
  skill: SkillName
  previous_score: number
  new_score: number
  delta: number
}

export interface AnalysisResult {
  mistakes: DetectedMistake[]
  primary_skill_issue: SkillName | null
  coaching: CoachingOutput
  skill_updates: SkillImpact[]
}

export interface AnalysisInput {
  pgn: string
  player_color: 'white' | 'black'
  move_evals: MoveEval[]
  current_skill_scores: Partial<Record<SkillName, number>>
  student_age?: number
  explanation_mode?: ExplanationMode
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const BLUNDER_CP    = 200
const MISTAKE_CP    = 100
const INACCURACY_CP = 50

const PIECE_VALUE: Record<string, number> = {
  p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000,
}

// Centipawn penalty applied to each skill score on mistake
const SEVERITY_PENALTY: Record<Severity, number> = {
  blunder:    10,
  mistake:     6,
  inaccuracy:  3,
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 — Severity classification
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Classify a single move based on centipawn loss from the player's perspective.
 * Returns null if the drop is below the inaccuracy threshold.
 */
export function classifySeverity(evalDrop: number): Severity | null {
  if (evalDrop >= BLUNDER_CP)    return 'blunder'
  if (evalDrop >= MISTAKE_CP)    return 'mistake'
  if (evalDrop >= INACCURACY_CP) return 'inaccuracy'
  return null
}

/**
 * Compute the centipawn loss from the player's perspective for one move.
 * Evals are white-positive; we flip for black's moves so "loss" is always positive.
 */
export function evalDrop(ev: MoveEval, playerColor: 'white' | 'black'): number {
  if (playerColor === 'white') {
    return ev.eval_before - ev.eval_after   // white drops when eval falls
  } else {
    return ev.eval_after - ev.eval_before   // black drops when white's eval rises
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 — Board geometry helpers (used by skill tagger)
// ─────────────────────────────────────────────────────────────────────────────

/** Returns all squares occupied by `color` that have zero defenders from `color`. */
function hangingSquares(chess: Chess, color: Color): Square[] {
  const hanging: Square[] = []
  const board = chess.board()

  for (const row of board) {
    for (const cell of row) {
      if (!cell || cell.color !== color) continue
      const sq = cell.square as Square
      const attackers = chess.attackers(sq, color === 'w' ? 'b' : 'w')
      const defenders = chess.attackers(sq, color)
      if (attackers.length > 0 && defenders.length === 0) {
        hanging.push(sq)
      }
    }
  }
  return hanging
}

/** Check if the move exposed a piece to capture (piece moved, piece behind it attacked). */
function createdHangingPiece(fenBefore: string, fenAfter: string, playerColor: Color): boolean {
  const after = new Chess(fenAfter)
  const hanging = hangingSquares(after, playerColor)
  if (hanging.length === 0) return false

  // Confirm the hanging pieces were NOT hanging before the move
  const before = new Chess(fenBefore)
  const wasAlreadyHanging = hangingSquares(before, playerColor)
  return hanging.some(sq => !wasAlreadyHanging.includes(sq))
}

/** Detect if a piece was moved to a square attacked by the opponent. */
function movedIntoAttack(_fenBefore: string, fenAfter: string, uci: string, playerColor: Color): boolean {
  const toSq = uci.slice(2, 4) as Square
  const after = new Chess(fenAfter)
  const opponentColor: Color = playerColor === 'w' ? 'b' : 'w'

  const piece = after.get(toSq)
  if (!piece) return false

  const attackers = after.attackers(toSq, opponentColor)

  // Opponent can take and it's a net material loss
  if (attackers.length === 0) return false
  const cheapestAttacker = Math.min(
    ...attackers.map(sq => PIECE_VALUE[after.get(sq)?.type ?? 'p'] ?? 100)
  )
  return cheapestAttacker < PIECE_VALUE[piece.type]
}

/** Count how many opponent pieces have multiple attackers after the move (fork detection). */
function countForkedPieces(fenAfter: string, playerColor: Color): number {
  const chess = new Chess(fenAfter)
  const board = chess.board()
  let forked = 0

  for (const row of board) {
    for (const cell of row) {
      if (!cell || cell.color === playerColor) continue
      const sq = cell.square as Square
      // Does the player attack this square with at least one piece?
      const attackers = chess.attackers(sq, playerColor)
      if (attackers.length >= 1 && PIECE_VALUE[cell.type] >= PIECE_VALUE['n']) {
        forked++
      }
    }
  }
  return forked
}

/** Return true if the student's king has no castling rights and sits in the center files (c–f). */
function kingIsUnsafe(fen: string, playerColor: Color): boolean {
  const chess = new Chess(fen)
  const board = chess.board()
  const centerFiles = ['c', 'd', 'e', 'f']

  for (const row of board) {
    for (const cell of row) {
      if (!cell || cell.type !== 'k' || cell.color !== playerColor) continue
      const file = cell.square[0]
      if (centerFiles.includes(file)) return true
    }
  }
  return false
}

/** Count how many of the player's minor/major pieces are still on their starting rank. */
function undevelopedPieces(fen: string, playerColor: Color): number {
  const chess = new Chess(fen)
  const board = chess.board()
  const startRank = playerColor === 'w' ? '1' : '8'
  let count = 0

  for (const row of board) {
    for (const cell of row) {
      if (!cell || cell.color !== playerColor) continue
      if (!['n', 'b', 'r', 'q'].includes(cell.type)) continue
      if (cell.square[1] === startRank) count++
    }
  }
  return count
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 — Skill tagger
// ─────────────────────────────────────────────────────────────────────────────

interface TagResult {
  skill_tag: SkillName
  root_cause: string
}

/**
 * Map a mistake to a skill category using board inspection.
 * Priority order mirrors what matters most tactically.
 */
export function mapToSkill(
  ev: MoveEval,
  playerColor: 'white' | 'black',
  drop: number,
  allEvals: MoveEval[]
): TagResult {
  const pc: Color = playerColor === 'white' ? 'w' : 'b'

  // 1. Did the player move a piece to a square where it can be captured for free?
  if (movedIntoAttack(ev.fen_before, ev.fen_after, ev.uci, pc)) {
    return {
      skill_tag: 'hanging_pieces',
      root_cause: 'piece moved to a square attacked by a less-valuable opponent piece',
    }
  }

  // 2. Did the move create a new hanging piece?
  if (createdHangingPiece(ev.fen_before, ev.fen_after, pc)) {
    return {
      skill_tag: 'hanging_pieces',
      root_cause: 'piece left undefended after the move',
    }
  }

  // 3. Did the opponent's PREVIOUS move set up a fork that the student didn't address?
  const prevOpponentPly = ev.ply - 1
  const prevOp = allEvals.find(e => e.ply === prevOpponentPly)
  if (prevOp) {
    const forkedAfter  = countForkedPieces(prevOp.fen_after, pc)
    const forkedBefore = countForkedPieces(prevOp.fen_before, pc)
    if (forkedAfter > forkedBefore) {
      return {
        skill_tag: 'forks',
        root_cause: 'opponent forked two pieces; student did not escape the fork',
      }
    }
  }

  // 4. King safety — king in center with significant eval drop
  if (drop >= MISTAKE_CP && kingIsUnsafe(ev.fen_after, pc)) {
    return {
      skill_tag: 'king_safety',
      root_cause: 'king left in the center during an open position',
    }
  }

  // 5. Development — opening phase (first 12 moves) with undeveloped pieces
  const moveNumber = Math.ceil((ev.ply + 1) / 2)
  if (moveNumber <= 12 && undevelopedPieces(ev.fen_after, pc) >= 3) {
    return {
      skill_tag: 'development',
      root_cause: 'several pieces still on starting squares in the opening',
    }
  }

  // 6. Threat awareness — opponent had a visible threat the student ignored
  if (prevOp && (prevOp.eval_before - prevOp.eval_after) < -50) {
    // Opponent's last move was strong — student didn't respond to it
    return {
      skill_tag: 'threat_awareness',
      root_cause: "opponent's threat was ignored; student continued with own plan",
    }
  }

  // 7. Endgame (move 30+) with significant drop
  if (moveNumber >= 30) {
    return {
      skill_tag: 'endgame_basics',
      root_cause: 'poor technique or conversion error in the endgame',
    }
  }

  // Default: tactical oversight
  return {
    skill_tag: 'threat_awareness',
    root_cause: 'missed opponent tactical resource',
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1+2 combined — Mistake detection pipeline
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Walk every player move, compute eval loss, classify severity, tag skill.
 */
export function detectMistakes(
  moveEvals: MoveEval[],
  playerColor: 'white' | 'black'
): DetectedMistake[] {
  const mistakes: DetectedMistake[] = []
  const playerParity = playerColor === 'white' ? 0 : 1  // white plays even plies (0,2,4…)

  for (const ev of moveEvals) {
    if (ev.ply % 2 !== playerParity) continue   // only student's moves

    const drop     = evalDrop(ev, playerColor)
    const severity = classifySeverity(drop)
    if (!severity) continue

    const { skill_tag, root_cause } = mapToSkill(ev, playerColor, drop, moveEvals)
    const moveNumber = playerColor === 'white'
      ? Math.floor(ev.ply / 2) + 1
      : Math.floor(ev.ply / 2) + 1

    mistakes.push({
      move_number: moveNumber,
      ply:         ev.ply,
      move:        ev.san,
      fen_before:  ev.fen_before,
      fen_after:   ev.fen_after,
      eval_before: ev.eval_before,
      eval_after:  ev.eval_after,
      eval_drop:   drop,
      severity,
      skill_tag,
      root_cause,
      explanation: buildExplanation(ev.san, severity, skill_tag, root_cause),
    })
  }

  return mistakes
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3 — Root-cause explanation builder
// ─────────────────────────────────────────────────────────────────────────────

const EXPLANATION_TEMPLATES: Record<SkillName, Record<Severity, string>> = {
  hanging_pieces: {
    blunder:    'Moving __MOVE__ left a piece with no defender — your opponent took it for free.',
    mistake:    '__MOVE__ moved a piece to a square where it could be captured cheaply.',
    inaccuracy: '__MOVE__ slightly weakened piece coordination, leaving a piece less protected.',
  },
  forks: {
    blunder:    'After __MOVE__, your opponent attacked two of your pieces at once. One had to be lost.',
    mistake:    '__MOVE__ did not escape the fork your opponent set up. A piece was lost.',
    inaccuracy: '__MOVE__ left your pieces on squares that could be forked next move.',
  },
  pins: {
    blunder:    '__MOVE__ pinned one of your pieces — it could not move without losing something bigger behind it.',
    mistake:    'After __MOVE__, a pin restricted your piece and cost material.',
    inaccuracy: '__MOVE__ left a piece in a potential pin that hurt your position.',
  },
  skewers: {
    blunder:    '__MOVE__ created a skewer — your valuable piece had to move and the piece behind it was taken.',
    mistake:    'After __MOVE__, a skewer cost you material.',
    inaccuracy: '__MOVE__ aligned pieces in a way that allowed a skewer threat.',
  },
  checkmate_patterns: {
    blunder:    '__MOVE__ allowed a checkmate pattern — your king was trapped.',
    mistake:    'After __MOVE__, your king came under a strong mating attack.',
    inaccuracy: '__MOVE__ weakened the shelter around your king.',
  },
  king_safety: {
    blunder:    '__MOVE__ left your king completely exposed in the center. The opponent attacked fast.',
    mistake:    'After __MOVE__, your king was not safe. You should have castled earlier.',
    inaccuracy: '__MOVE__ delayed castling, leaving the king slightly exposed.',
  },
  development: {
    blunder:    '__MOVE__ wasted time in the opening. Your pieces were still at home while the opponent attacked.',
    mistake:    'After __MOVE__, several pieces were still undeveloped. Get pieces out early!',
    inaccuracy: '__MOVE__ moved the same piece twice when another piece needed to come out.',
  },
  pawn_structure: {
    blunder:    '__MOVE__ created a serious pawn weakness that cost the game.',
    mistake:    'After __MOVE__, your pawns became weak and hard to defend.',
    inaccuracy: '__MOVE__ slightly damaged your pawn structure.',
  },
  endgame_basics: {
    blunder:    '__MOVE__ threw away a winning endgame position.',
    mistake:    'After __MOVE__, the endgame technique was poor and advantage was lost.',
    inaccuracy: '__MOVE__ was slightly inaccurate technique in the endgame.',
  },
  threat_awareness: {
    blunder:    '__MOVE__ completely missed what the opponent was threatening. A big piece was lost.',
    mistake:    'After __MOVE__, you ignored your opponent\'s plan. That cost material.',
    inaccuracy: '__MOVE__ overlooked a small threat that the opponent used to gain space.',
  },
  tactics_combo: {
    blunder:    '__MOVE__ missed a multi-step combination the opponent had prepared.',
    mistake:    'After __MOVE__, the opponent executed a tactical sequence that cost material.',
    inaccuracy: '__MOVE__ walked into a short tactical trick.',
  },
}

function buildExplanation(san: string, severity: Severity, skill: SkillName, _rootCause: string): string {
  const template = EXPLANATION_TEMPLATES[skill]?.[severity]
    ?? `Playing ${san} was a ${severity} — it significantly weakened your position.`
  return template.replace('__MOVE__', san)
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 4 — Coaching output generator
// ─────────────────────────────────────────────────────────────────────────────

/** Determine primary skill issue from frequency of tagged mistakes. */
export function primarySkillIssue(mistakes: DetectedMistake[]): SkillName | null {
  if (mistakes.length === 0) return null

  const freq: Partial<Record<SkillName, number>> = {}
  for (const m of mistakes) {
    // Weight by severity: blunder=3, mistake=2, inaccuracy=1
    const weight = m.severity === 'blunder' ? 3 : m.severity === 'mistake' ? 2 : 1
    freq[m.skill_tag] = (freq[m.skill_tag] ?? 0) + weight
  }

  return (Object.entries(freq).sort(([, a], [, b]) => b - a)[0]?.[0] ?? null) as SkillName | null
}

const TRAINING_PLANS: Record<SkillName, string[]> = {
  hanging_pieces:    [
    'Do 10 "hanging piece" puzzles — find which pieces have no defenders.',
    'Before every move, ask: "Can my opponent take any of my pieces for free?"',
    'Play 3 slow games (10+ minutes each) focusing only on piece safety.',
  ],
  forks:             [
    'Study 10 knight fork puzzles — learn the L-shaped attack pattern.',
    'When your opponent moves a knight, check all squares it attacks immediately.',
    'Practice with the lesson: "The Knight Fork."',
  ],
  pins:              [
    'Do 10 pin puzzles — learn to spot when a piece cannot move safely.',
    'Before moving a piece, check if it is blocking a more valuable piece behind it.',
    'Play slow games and pause before moving to check for pins.',
  ],
  skewers:           [
    'Do 5 skewer puzzles — practice recognising pieces lined up on diagonals/files.',
    'Check that your queen and rooks are not lined up with your king after each move.',
    'Study the "Skewer Attack" lesson in the lesson section.',
  ],
  checkmate_patterns:[
    'Solve 10 "checkmate in one" puzzles daily for one week.',
    'Learn the back-rank checkmate pattern first — it appears in almost every beginner game.',
    'After each game, look: did your opponent miss a checkmate? Did you?',
  ],
  king_safety:       [
    'Play 5 games with the specific goal of castling before move 10 in each one.',
    'Study the lesson: "Castle to Keep Your King Safe."',
    'Solve 5 king safety puzzles — find the move that gets the king to safety.',
  ],
  development:       [
    'Play 5 games and write down how many moves it took to develop all your pieces.',
    'Follow the rule: knights and bishops out before move 8, then castle.',
    'Review the lesson: "Bring Out Your Pieces First."',
  ],
  pawn_structure:    [
    'Study doubled pawn and isolated pawn patterns in the lessons section.',
    'Before pushing a pawn, ask: does this create a weakness I cannot fix later?',
    'Play 5 games focused on keeping your pawns connected.',
  ],
  endgame_basics:    [
    'Practice king and pawn endgames — move your king to the center.',
    'Study rook endgame basics: rooks behind passed pawns.',
    'Solve 5 endgame puzzles focusing on pawn promotion technique.',
  ],
  threat_awareness:  [
    'Before every move, stop and ask: what does my opponent want to do next?',
    'Review the lesson: "Watch What Your Opponent is Doing."',
    'In your next 5 games, write down your opponent\'s last move and explain WHY they played it.',
  ],
  tactics_combo:     [
    'Solve 5 multi-step combination puzzles — work through them slowly.',
    'Practice calculating two moves ahead before committing to a move.',
    'Review any game where you missed a combination with your coach.',
  ],
}

const DONE_WELL_BY_SKILL: Record<SkillName, string> = {
  hanging_pieces:     'You controlled the center well and kept most of your pieces active.',
  forks:              'Your piece placement was generally solid outside the key mistake.',
  pins:               'You showed good awareness of tactics in most of the game.',
  skewers:            'Your positional understanding was sound for most of the game.',
  checkmate_patterns: 'You defended well and kept your king safe for most of the game.',
  king_safety:        'You developed your pieces well and controlled good squares.',
  development:        'You spotted some tactics during the game — that is a great sign.',
  pawn_structure:     'Your piece activity was generally good throughout the game.',
  endgame_basics:     'You played the opening and middlegame confidently.',
  threat_awareness:   'Your opening moves were solid and you developed pieces correctly.',
  tactics_combo:      'You played with good energy and looked for active moves.',
}

const NEXT_FOCUS_BY_SKILL: Record<SkillName, string> = {
  hanging_pieces:     'Before every move: scan ALL your pieces and ask "is each one protected?"',
  forks:              'When your opponent moves a knight, immediately check which squares it now attacks.',
  pins:               'After your opponent moves, check if any of your pieces are now pinned.',
  skewers:            'Make sure your valuable pieces are never lined up with your king on the same file or diagonal.',
  checkmate_patterns: 'After every opponent move, ask: "Is my king safe right now?"',
  king_safety:        'Castle in the first 10 moves of every game — make it a habit.',
  development:        'Do not move the same piece twice in the opening unless forced to.',
  pawn_structure:     'Think carefully before every pawn move — pawns cannot go backwards.',
  endgame_basics:     'In the endgame, activate your king immediately — move it toward the center.',
  threat_awareness:   'Before playing your move, always ask: "What does my opponent want to do?"',
  tactics_combo:      'Look for two-move combinations before settling on your chosen move.',
}

/**
 * Build full coaching output from analysis results.
 * Language adapts based on explanation_mode.
 */
export function generateCoaching(
  mistakes: DetectedMistake[],
  primarySkill: SkillName | null,
  skillUpdates: SkillImpact[],
  options: {
    explanation_mode: ExplanationMode
    game_result: 'white_wins' | 'black_wins' | 'draw' | 'abandoned' | null
    player_color: 'white' | 'black'
    total_moves: number
  }
): CoachingOutput {
  const { explanation_mode, game_result, player_color, total_moves } = options
  const won = (game_result === 'white_wins' && player_color === 'white') ||
              (game_result === 'black_wins' && player_color === 'black')
  const drew = game_result === 'draw'

  // Quick summary
  const blunders    = mistakes.filter(m => m.severity === 'blunder').length
  const allMistakes = mistakes.filter(m => m.severity !== 'inaccuracy').length

  let quick_summary: string
  if (explanation_mode === 'simple') {
    quick_summary = won
      ? `Great job — you won! You made ${blunders > 0 ? blunders + ' big mistake' + (blunders > 1 ? 's' : '') : 'no big mistakes'}. Let\'s make your next game even better.`
      : drew
      ? `You drew — that\'s okay! There ${allMistakes === 1 ? 'was 1 mistake' : `were ${allMistakes} mistakes`} that we can fix together.`
      : `You did not win this time. You made ${blunders} big mistake${blunders !== 1 ? 's' : ''} — but every game teaches you something!`
  } else {
    quick_summary = won
      ? `Good result — ${blunders} blunder${blunders !== 1 ? 's' : ''} across ${total_moves} moves. Solid game with room to tighten up.`
      : drew
      ? `Draw over ${total_moves} moves. ${allMistakes} significant mistake${allMistakes !== 1 ? 's' : ''} identified — worth reviewing.`
      : `Loss in ${total_moves} moves. ${blunders} blunder${blunders !== 1 ? 's' : ''} and ${allMistakes - blunders} mistake${(allMistakes - blunders) !== 1 ? 's' : ''} detected.`
  }

  // Key mistake — the worst blunder, or worst mistake if no blunder
  const sorted  = [...mistakes].sort((a, b) => b.eval_drop - a.eval_drop)
  const worst   = sorted[0] ?? null
  const key_mistake = worst ? {
    move_number: worst.move_number,
    move:        worst.move,
    what_happened: worst.explanation,
    why_wrong: buildWhyWrong(worst, explanation_mode),
  } : null

  // Done well — based on primary skill or generic if clean game
  const done_well = mistakes.length === 0
    ? explanation_mode === 'simple'
      ? 'You did not make any big mistakes — amazing work!'
      : 'No significant errors detected — clean, disciplined play.'
    : DONE_WELL_BY_SKILL[primarySkill ?? 'threat_awareness']

  // Next game focus
  const next_game_focus = primarySkill
    ? NEXT_FOCUS_BY_SKILL[primarySkill]
    : 'Keep checking: are all your pieces protected before every move?'

  // Training plan
  const training_plan = primarySkill
    ? TRAINING_PLANS[primarySkill]
    : TRAINING_PLANS['threat_awareness']

  return {
    quick_summary,
    key_mistake,
    done_well,
    next_game_focus,
    training_plan,
    skill_impact: skillUpdates,
  }
}

function buildWhyWrong(mistake: DetectedMistake, mode: ExplanationMode): string {
  const templates: Record<ExplanationMode, string> = {
    simple: `This move lost material because ${mistake.root_cause}. Always check before you move!`,
    intermediate: `The problem was ${mistake.root_cause}. This caused a ${mistake.severity} — try to spot these patterns before moving.`,
    advanced: `Root cause: ${mistake.root_cause}. Eval dropped ${(mistake.eval_drop / 100).toFixed(1)} pawns — a ${mistake.severity} by definition.`,
  }
  return templates[mode]
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 5 — Skill score updates
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Apply centipawn-loss-based penalties to skill scores.
 *
 * Design choices:
 * - Only the tagged skill loses points (not all skills)
 * - Repeated same mistake in one game applies 1.5× penalty
 * - Score is clamped to [0, 100]
 * - Diminishing return: large existing penalty reduces new penalty weight
 */
export function updateSkillScores(
  mistakes: DetectedMistake[],
  currentScores: Partial<Record<SkillName, number>>
): SkillImpact[] {
  // Count mistakes per skill (for repeat-mistake penalty)
  const mistakeCount: Partial<Record<SkillName, number>> = {}
  for (const m of mistakes) {
    mistakeCount[m.skill_tag] = (mistakeCount[m.skill_tag] ?? 0) + 1
  }

  // Accumulate total penalty per skill
  const pendingDeltas: Partial<Record<SkillName, number>> = {}

  for (const m of mistakes) {
    const basePenalty = SEVERITY_PENALTY[m.severity]
    const count       = mistakeCount[m.skill_tag] ?? 1
    // 1.5× multiplier if this skill was tagged more than once (pattern, not fluke)
    const multiplier  = count > 1 ? 1.5 : 1.0
    const penalty     = basePenalty * multiplier

    pendingDeltas[m.skill_tag] = (pendingDeltas[m.skill_tag] ?? 0) + penalty
  }

  // Convert to SkillImpact[]
  const impacts: SkillImpact[] = []

  for (const [skill, totalPenalty] of Object.entries(pendingDeltas) as [SkillName, number][]) {
    const prev    = currentScores[skill] ?? 50
    // Diminishing return: if score already very low, penalty is slightly reduced
    const weight  = prev < 30 ? 0.6 : prev < 50 ? 0.8 : 1.0
    const delta   = -(totalPenalty * weight)
    const newScore = Math.max(0, Math.min(100, prev + delta))

    impacts.push({
      skill,
      previous_score: prev,
      new_score:       parseFloat(newScore.toFixed(1)),
      delta:           parseFloat(delta.toFixed(1)),
    })
  }

  // Sort: biggest loss first
  return impacts.sort((a, b) => a.delta - b.delta)
}

// ─────────────────────────────────────────────────────────────────────────────
// Main entry point
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Full analysis pipeline.
 *
 * Call this with Stockfish-evaluated move data.
 * Returns structured mistakes, coaching, and skill score changes.
 */
export function runAnalysis(input: AnalysisInput): AnalysisResult {
  const {
    pgn,
    player_color,
    move_evals,
    current_skill_scores,
    explanation_mode = 'intermediate',
  } = input

  // Parse game to get result and move count
  const chess = new Chess()
  chess.loadPgn(pgn)
  const history    = chess.history()
  const total_moves = history.length

  // Infer game result from PGN headers
  const resultHeader = pgn.match(/\[Result "([^"]+)"\]/)?.[1] ?? '*'
  const game_result: 'white_wins' | 'black_wins' | 'draw' | 'abandoned' | null =
    resultHeader === '1-0'      ? 'white_wins'
    : resultHeader === '0-1'    ? 'black_wins'
    : resultHeader === '1/2-1/2'? 'draw'
    : null

  const mistakes     = detectMistakes(move_evals, player_color)
  const primary      = primarySkillIssue(mistakes)
  const skill_updates = updateSkillScores(mistakes, current_skill_scores)
  const coaching     = generateCoaching(mistakes, primary, skill_updates, {
    explanation_mode,
    game_result,
    player_color,
    total_moves,
  })

  return {
    mistakes,
    primary_skill_issue: primary,
    coaching,
    skill_updates,
  }
}
