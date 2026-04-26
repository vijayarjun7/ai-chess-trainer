import { Chess } from 'chess.js'
import type { GameResultPgn } from '@/types/tournament'

export interface PgnOptions {
  white?:  string
  black?:  string
  event?:  string
  date?:   string
  result?: GameResultPgn
}

// Returns a valid PGN string or null if any move is illegal.
export function buildPgn(moves: string[], options: PgnOptions = {}): string | null {
  const chess = new Chess()

  for (const san of moves) {
    try {
      const m = chess.move(san.trim())
      if (!m) return null
    } catch {
      return null
    }
  }

  // Auto-detect result from game state; fall back to provided option or '*'
  let result: GameResultPgn = options.result ?? '*'
  if (chess.isGameOver()) {
    if (chess.isCheckmate()) result = chess.turn() === 'w' ? '0-1' : '1-0'
    else result = '1/2-1/2'
  }

  chess.header('Event',  options.event  ?? 'Tournament')
  chess.header('White',  options.white  ?? '?')
  chess.header('Black',  options.black  ?? '?')
  chess.header('Date',   options.date   ?? new Date().toISOString().split('T')[0].replace(/-/g, '.'))
  chess.header('Result', result)

  return chess.pgn()
}
