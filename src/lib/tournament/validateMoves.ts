import { Chess } from 'chess.js'
import type { ValidationResult } from '@/types/tournament'

export function validateMoveSequence(moves: string[]): ValidationResult {
  const chess = new Chess()

  for (let i = 0; i < moves.length; i++) {
    const san = moves[i].trim()
    if (!san) continue

    try {
      const result = chess.move(san)
      if (!result) {
        return buildError(i, san, moves)
      }
    } catch {
      return buildError(i, san, moves)
    }
  }

  return { valid: true, invalidAtIndex: null, errorMessage: null, validUpToIndex: moves.length }
}

function buildError(index: number, san: string, moves: string[]): ValidationResult {
  const moveNum = Math.floor(index / 2) + 1
  const color   = index % 2 === 0 ? '.' : '…'
  return {
    valid:          false,
    invalidAtIndex: index,
    errorMessage:   `Move ${moveNum}${color} "${san}" is not legal in this position`,
    validUpToIndex: index,
  }
}

// Returns FEN after applying the first `count` moves (0 = starting position)
export function fenAfterMoves(moves: string[], count: number): string {
  const chess = new Chess()
  const limit = Math.min(count, moves.length)
  for (let i = 0; i < limit; i++) {
    try { chess.move(moves[i]) } catch { break }
  }
  return chess.fen()
}

// Returns true if the game is over after applying all moves
export function detectResult(moves: string[]): '1-0' | '0-1' | '1/2-1/2' | '*' {
  const chess = new Chess()
  for (const san of moves) {
    try { chess.move(san) } catch { break }
  }
  if (!chess.isGameOver()) return '*'
  if (chess.isCheckmate())  return chess.turn() === 'w' ? '0-1' : '1-0'
  return '1/2-1/2'
}
