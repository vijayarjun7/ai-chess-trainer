'use client'

import type { OpponentConfig, OpponentStyleBias } from '@/types/chess'
import type { OpponentStyle, RatingBand } from '@/types/database'
import type { SkillName } from '@/types/skills'

// ── Student profile snapshot used to compute opponent config ─────────────────

export interface StudentProfile {
  ratingBand:       RatingBand
  estimatedRating:  number      // 0–2000+
  avgSkillScore:    number      // 0–100 (50 = no data)
  recentWeaknesses: SkillName[]
}

// ── Per-band base configs ─────────────────────────────────────────────────────
// engineDepth is for Stockfish `go depth N`
// candidateMovePoolSize is the MultiPV N value

type BaseConfig = Omit<OpponentConfig, 'styleBias' | 'allowTrainingOpportunities' | 'trainingSkill'>

const BAND_BASE: Record<RatingBand, BaseConfig> = {
  'beginner':   { targetStrength: 2,  engineDepth: 1,  candidateMovePoolSize: 6, randomness: 0.70, mistakeRate: 0.22 },
  '400-700':    { targetStrength: 3,  engineDepth: 3,  candidateMovePoolSize: 5, randomness: 0.50, mistakeRate: 0.12 },
  '700-1000':   { targetStrength: 5,  engineDepth: 6,  candidateMovePoolSize: 4, randomness: 0.28, mistakeRate: 0.06 },
  '1000-1300':  { targetStrength: 7,  engineDepth: 10, candidateMovePoolSize: 3, randomness: 0.12, mistakeRate: 0.03 },
  '1300+':      { targetStrength: 9,  engineDepth: 14, candidateMovePoolSize: 2, randomness: 0.04, mistakeRate: 0.01 },
}

// ── Style bias presets ────────────────────────────────────────────────────────

export const STYLE_BIAS: Record<OpponentStyle, OpponentStyleBias> = {
  balanced: {
    preferCaptures: 1.0, preferChecks: 1.0, preferPawnMoves: 1.0,
    preferDevelopment: 1.0, preferKingAttack: 1.0,
    preferSimplification: 1.0, preferPassivity: 1.0,
  },
  aggressive: {
    preferCaptures: 1.6, preferChecks: 2.0, preferPawnMoves: 0.8,
    preferDevelopment: 0.8, preferKingAttack: 2.2,
    preferSimplification: 0.4, preferPassivity: 0.3,
  },
  defensive: {
    preferCaptures: 0.7, preferChecks: 0.5, preferPawnMoves: 1.2,
    preferDevelopment: 1.1, preferKingAttack: 0.4,
    preferSimplification: 1.6, preferPassivity: 2.0,
  },
  tactical: {
    preferCaptures: 1.8, preferChecks: 1.7, preferPawnMoves: 0.7,
    preferDevelopment: 0.9, preferKingAttack: 1.5,
    preferSimplification: 0.6, preferPassivity: 0.4,
  },
  positional: {
    preferCaptures: 0.8, preferChecks: 0.7, preferPawnMoves: 1.4,
    preferDevelopment: 1.8, preferKingAttack: 0.8,
    preferSimplification: 0.9, preferPassivity: 1.2,
  },
  endgame: {
    preferCaptures: 1.4, preferChecks: 0.9, preferPawnMoves: 1.6,
    preferDevelopment: 0.5, preferKingAttack: 0.6,
    preferSimplification: 2.2, preferPassivity: 1.0,
  },
  'blunder-friendly': {
    // Very high randomness already baked into config; style bias stays neutral
    preferCaptures: 0.8, preferChecks: 0.7, preferPawnMoves: 1.1,
    preferDevelopment: 1.0, preferKingAttack: 0.7,
    preferSimplification: 1.0, preferPassivity: 1.3,
  },
  'coach-mode': {
    // Training-skill bias is applied dynamically; base is balanced
    preferCaptures: 1.0, preferChecks: 1.0, preferPawnMoves: 1.0,
    preferDevelopment: 1.0, preferKingAttack: 1.0,
    preferSimplification: 1.0, preferPassivity: 1.0,
  },
}

// ── Training-skill bias overlay ───────────────────────────────────────────────
// Mutates a copy of the style bias toward moves that create training opportunities.

function applyTrainingBias(bias: OpponentStyleBias, skill: SkillName): void {
  switch (skill) {
    case 'hanging_pieces':
      // Delay captures — opponent leaves pieces "hanging" briefly so student can notice
      bias.preferCaptures  *= 0.35
      bias.preferPassivity *= 1.6
      break
    case 'forks':
      bias.preferCaptures   *= 1.3
      bias.preferKingAttack *= 1.2
      break
    case 'king_safety':
      bias.preferKingAttack *= 2.0
      bias.preferChecks     *= 1.5
      bias.preferCaptures   *= 1.2
      break
    case 'development':
      bias.preferDevelopment *= 1.5
      bias.preferKingAttack  *= 1.3
      break
    case 'threat_awareness':
      bias.preferChecks   *= 1.4
      bias.preferCaptures *= 1.3
      break
    case 'checkmate_patterns':
      bias.preferChecks     *= 1.8
      bias.preferKingAttack *= 1.8
      break
    case 'endgame_basics':
      bias.preferSimplification *= 1.8
      break
    case 'pawn_structure':
      bias.preferPawnMoves *= 1.6
      bias.preferPassivity *= 0.8
      break
    case 'pins':
    case 'skewers':
    case 'tactics_combo':
      bias.preferCaptures   *= 1.5
      bias.preferKingAttack *= 1.2
      break
    default:
      break
  }
}

// ── Main builder ──────────────────────────────────────────────────────────────

export function getOpponentConfig(
  profile:         StudentProfile,
  style:           OpponentStyle,
  trainingSkill:   SkillName | null,
): OpponentConfig {
  const base = { ...BAND_BASE[profile.ratingBand] }

  // Fine-tune depth within the band using estimatedRating
  const rating = profile.estimatedRating
  let depthBonus = 0
  if      (rating >= 300  && rating < 400)  depthBonus = 1
  else if (rating >= 500  && rating < 700)  depthBonus = 1
  else if (rating >= 800  && rating < 1000) depthBonus = 2
  else if (rating >= 1100 && rating < 1300) depthBonus = 2
  else if (rating >= 1500)                  depthBonus = Math.min(4, Math.floor((rating - 1300) / 200))

  // High skill score → slightly harder; low skill score → softer
  const skillAdj   = (profile.avgSkillScore - 50) / 100   // –0.5 → +0.5
  const depthAdj   = Math.round(skillAdj * 2)
  const randomAdj  = -(skillAdj * 0.08)

  const engineDepth = Math.max(1, Math.min(18, base.engineDepth + depthBonus + depthAdj))
  const randomness  = Math.max(0.01, Math.min(0.90, base.randomness + randomAdj))

  // Extra penalty for blunder-friendly: push randomness and mistakeRate up further
  const isBF     = style === 'blunder-friendly'
  const finalRng = isBF ? Math.min(0.90, randomness + 0.20) : randomness
  const finalMR  = isBF ? Math.min(0.40, base.mistakeRate + 0.18) : base.mistakeRate

  // Build style bias; coach-mode defaults to balanced then training overlay takes over
  const bias: OpponentStyleBias = { ...STYLE_BIAS[style] }
  if (trainingSkill) applyTrainingBias(bias, trainingSkill)

  return {
    targetStrength:             base.targetStrength,
    engineDepth,
    candidateMovePoolSize:      base.candidateMovePoolSize,
    randomness:                 finalRng,
    mistakeRate:                finalMR,
    styleBias:                  bias,
    allowTrainingOpportunities: true,
    trainingSkill,
  }
}

// Fallback when no student profile is available (manual level 1–10)
export function defaultOpponentConfig(level: number, style: OpponentStyle): OpponentConfig {
  const bands: RatingBand[] = ['beginner', '400-700', '700-1000', '1000-1300', '1300+']
  const idx   = Math.min(4, Math.floor((level - 1) / 2))
  const base  = { ...BAND_BASE[bands[idx]] }

  return {
    ...base,
    styleBias:                  { ...STYLE_BIAS[style] },
    allowTrainingOpportunities: false,
    trainingSkill:              null,
  }
}
