import { Chess } from 'chess.js'

export function pgnToMoveList(pgn: string): string[] {
  const chess = new Chess()
  chess.loadPgn(pgn)
  return chess.history()
}

export function getMoveCount(pgn: string): number {
  try {
    const chess = new Chess()
    chess.loadPgn(pgn)
    return chess.history().length
  } catch {
    return 0
  }
}

export function isValidPgn(pgn: string): boolean {
  try {
    const chess = new Chess()
    chess.loadPgn(pgn)
    return true
  } catch {
    return false
  }
}

export function getGameResult(pgn: string): '1-0' | '0-1' | '1/2-1/2' | '*' {
  const match = pgn.match(/\[Result "([^"]+)"\]/)
  if (!match) return '*'
  return match[1] as '1-0' | '0-1' | '1/2-1/2' | '*'
}

export function pgnResultToDbResult(pgn: string): string {
  const r = getGameResult(pgn)
  if (r === '1-0') return 'white_wins'
  if (r === '0-1') return 'black_wins'
  if (r === '1/2-1/2') return 'draw'
  return 'abandoned'
}
