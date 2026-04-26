'use client'

import { Chess, type Square } from 'chess.js'
import type { OpponentConfig, OpponentStyleBias } from '@/types/chess'
import type { SkillName } from '@/types/skills'

// ── Candidate move from Stockfish MultiPV ────────────────────────────────────

export interface CandidateMove {
  uci:   string   // e.g. "e2e4" or "e7e8q"
  score: number   // engine centipawn score (white-positive)
  rank:  number   // 1 = engine's top choice
}

// ── Move characteristics derived from chess.js position analysis ─────────────

export interface MoveCharacteristics {
  isCapture:       boolean
  isCheck:         boolean
  isPromotion:     boolean
  isPawnMove:      boolean
  isDevelopment:   boolean   // knight/bishop moving off its starting rank
  attacksKingArea: boolean   // destination is within 2 squares of enemy king
  isKingMove:      boolean
  isCastle:        boolean
  pieceType:       string    // 'p' 'n' 'b' 'r' 'q' 'k'
}

export function analyzeMoveCharacteristics(
  fen: string,
  uci: string,
): MoveCharacteristics {
  const blank: MoveCharacteristics = {
    isCapture: false, isCheck: false, isPromotion: false,
    isPawnMove: false, isDevelopment: false, attacksKingArea: false,
    isKingMove: false, isCastle: false, pieceType: '',
  }

  const from  = uci.slice(0, 2) as Square
  const to    = uci.slice(2, 4) as Square
  const promo = uci.length === 5 ? uci[4] : undefined

  let chess: Chess
  try {
    chess = new Chess(fen)
  } catch {
    return blank
  }

  const piece = chess.get(from)
  if (!piece) return blank

  const targetPiece = chess.get(to)
  const isCapture   = targetPiece !== null

  // Apply the move to read post-move state
  let isCheck  = false
  let isCastle = false
  try {
    const result = chess.move({ from, to, promotion: promo as 'q' | 'r' | 'b' | 'n' | undefined })
    isCheck  = chess.inCheck()
    isCastle = result.flags.includes('k') || result.flags.includes('q')
  } catch {
    return blank
  }

  const isPawnMove  = piece.type === 'p'
  const isPromotion = !!promo
  const isKingMove  = piece.type === 'k'

  // Development: knight or bishop leaving its home rank for the first time
  const homeRank = piece.color === 'w' ? '1' : '8'
  const isDevelopment =
    (piece.type === 'n' || piece.type === 'b') &&
    from[1] === homeRank

  // King area: find enemy king; check if `to` is within ≤2 files/ranks
  let attacksKingArea = false
  const enemyColor = piece.color === 'w' ? 'b' : 'w'
  for (const row of chess.board()) {
    for (const cell of row) {
      if (!cell || cell.type !== 'k' || cell.color !== enemyColor) continue
      const kFile = cell.square.charCodeAt(0) - 97   // 'a'=0
      const kRank = parseInt(cell.square[1]) - 1
      const tFile = to.charCodeAt(0) - 97
      const tRank = parseInt(to[1]) - 1
      if (Math.abs(kFile - tFile) <= 2 && Math.abs(kRank - tRank) <= 2) {
        attacksKingArea = true
      }
    }
  }

  return {
    isCapture, isCheck, isPromotion, isPawnMove,
    isDevelopment, attacksKingArea, isKingMove, isCastle,
    pieceType: piece.type,
  }
}

// ── Style scoring ─────────────────────────────────────────────────────────────

export function scoreMoveForStyle(
  chars:         MoveCharacteristics,
  bias:          OpponentStyleBias,
  trainingSkill: SkillName | null,
  isOpening:     boolean,
): number {
  let s = 1.0

  if (chars.isCapture)       s *= bias.preferCaptures
  if (chars.isCheck)         s *= bias.preferChecks
  if (chars.isPawnMove)      s *= bias.preferPawnMoves
  if (chars.isDevelopment)   s *= bias.preferDevelopment
  if (chars.attacksKingArea) s *= bias.preferKingAttack
  // Castling is a safe consolidating move — weight with passivity component
  if (chars.isCastle)        s *= 0.9 + bias.preferPassivity * 0.1

  // In the opening always gently nudge development regardless of style
  if (isOpening && chars.isDevelopment) s *= 1.25

  // Training-specific extra bonuses
  if (trainingSkill === 'king_safety'        && chars.attacksKingArea) s *= 1.5
  if (trainingSkill === 'development'        && chars.isDevelopment)   s *= 1.4
  if (trainingSkill === 'checkmate_patterns' && chars.isCheck)         s *= 1.6
  if (trainingSkill === 'threat_awareness'   && chars.isCheck)         s *= 1.3

  return Math.max(0.01, s)
}

// ── Move selector ─────────────────────────────────────────────────────────────

export function selectFromCandidates(
  candidates:  CandidateMove[],
  config:      OpponentConfig,
  fen:         string,
  moveNumber:  number,
): string {
  if (candidates.length === 0) return ''
  if (candidates.length === 1) return candidates[0].uci

  const isOpening = moveNumber <= 10

  // ── Intentional mistake: pick from weakest candidates ─────────────────────
  if (Math.random() < config.mistakeRate && candidates.length >= 3) {
    const weakStart = Math.floor(candidates.length * 0.55)
    const weakPool  = candidates.slice(weakStart)
    return weakPool[Math.floor(Math.random() * weakPool.length)].uci
  }

  // ── Score each candidate ───────────────────────────────────────────────────
  // Opening bonus: extra randomness to vary the opening line each game
  const openingExtra = isOpening ? 0.3 : 0.0

  const scored = candidates.map(c => {
    const chars = analyzeMoveCharacteristics(fen, c.uci)

    // Rank-based decay: rank 1 → 1.0, rank 2 → 0.63, rank 3 → 0.46, etc.
    // Using power-law so rank 2 is still competitive but rank 1 is favoured
    const rankWeight = 1.0 / Math.pow(c.rank, 0.75)

    const styleMult  = scoreMoveForStyle(chars, config.styleBias, config.trainingSkill, isOpening)

    // Noise: uniformly distributed within [-randomness, +randomness]
    // Extra noise in opening to keep the opponent unpredictable
    const noise = 1.0 +
      (Math.random() - 0.5) * config.randomness * 2 +
      Math.random() * openingExtra

    return { uci: c.uci, weight: Math.max(0.001, rankWeight * styleMult * noise) }
  })

  // ── Weighted random draw ───────────────────────────────────────────────────
  const total = scored.reduce((sum, s) => sum + s.weight, 0)
  let pick = Math.random() * total
  for (const s of scored) {
    pick -= s.weight
    if (pick <= 0) return s.uci
  }
  return scored[0].uci
}
