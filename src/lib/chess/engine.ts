'use client'

import { Chess } from 'chess.js'
import type { OpponentConfig } from '@/types/chess'
import type { OpponentStyle } from '@/types/database'
import { defaultOpponentConfig } from './opponentConfig'
import { selectFromCandidates, type CandidateMove } from './opponentStyles'

// ── Stockfish worker singleton ────────────────────────────────────────────────

let worker: Worker | null = null
let initPromise: Promise<Worker> | null = null

function initWorker(): Promise<Worker> {
  if (initPromise) return initPromise

  initPromise = new Promise((resolve, reject) => {
    try {
      const w = new Worker('/stockfish/stockfish.js')

      const timer = setTimeout(() => {
        console.warn('[engine] Stockfish init timeout — falling back to random moves')
        reject(new Error('timeout'))
      }, 15000)

      w.onmessage = (e: MessageEvent) => {
        const msg = typeof e.data === 'string' ? e.data : ''
        if (msg.includes('uciok')) {
          clearTimeout(timer)
          worker = w
          w.postMessage('setoption name Use NNUE value false')
          w.postMessage('isready')
        }
        if (msg.includes('readyok')) {
          resolve(w)
        }
      }

      w.onerror = (err) => {
        clearTimeout(timer)
        console.warn('[engine] Stockfish worker error:', err)
        reject(err)
      }

      w.postMessage('uci')
    } catch (err) {
      reject(err)
    }
  })

  return initPromise
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BestMoveResult {
  bestMove: string
  ponder:   string | null
}

interface PVInfo {
  pvIndex: number
  score:   number
  move:    string
  depth:   number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function randomMove(fen: string): BestMoveResult {
  const chess = new Chess(fen)
  const moves = chess.moves({ verbose: true })
  if (moves.length === 0) return { bestMove: '(none)', ponder: null }
  const m = moves[Math.floor(Math.random() * moves.length)]
  return { bestMove: m.from + m.to + (m.promotion ?? ''), ponder: null }
}

function parsePVLine(line: string): PVInfo | null {
  if (!line.includes('multipv')) return null

  const pvIdxM = line.match(/multipv (\d+)/)
  const depthM = line.match(/\bdepth (\d+)/)
  const scoreM = line.match(/score cp (-?\d+)/)
  const mateM  = line.match(/score mate (-?\d+)/)
  // PV move: first coordinate-notation token after " pv "
  const pvM    = line.match(/ pv ([a-h][1-8][a-h][1-8][qrbnQRBN]?)/)

  if (!pvIdxM || !pvM) return null

  const score = scoreM
    ? parseInt(scoreM[1])
    : mateM
    ? (parseInt(mateM[1]) > 0 ? 29000 : -29000)
    : 0

  return {
    pvIndex: parseInt(pvIdxM[1]),
    score,
    move:  pvM[1],
    depth: depthM ? parseInt(depthM[1]) : 0,
  }
}

// Full-move number from FEN (used to detect opening phase)
function fullMoveFromFen(fen: string): number {
  return parseInt(fen.split(' ')[5] ?? '1')
}

// ── getBestMove ───────────────────────────────────────────────────────────────
//
// Overloaded for backward compatibility:
//   getBestMove(fen, level, style?)          — derives OpponentConfig internally
//   getBestMove(fen, opponentConfig)         — uses caller-supplied config

export async function getBestMove(
  fen:              string,
  levelOrConfig:    number | OpponentConfig,
  style:            OpponentStyle = 'balanced',
): Promise<BestMoveResult> {
  const config: OpponentConfig =
    typeof levelOrConfig === 'number'
      ? defaultOpponentConfig(levelOrConfig, style)
      : levelOrConfig

  // ── Acquire Stockfish worker ───────────────────────────────────────────────
  let sf: Worker
  try {
    sf = await Promise.race([
      initWorker(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 9000)
      ),
    ])
  } catch {
    console.warn('[engine] Stockfish unavailable — using random move')
    return randomMove(fen)
  }

  const depth      = config.engineDepth
  const poolSize   = config.candidateMovePoolSize
  const moveNumber = fullMoveFromFen(fen)

  // Time budget: scale with depth but keep it reasonable
  const budgetMs = Math.min(4500, 200 + depth * 180)

  return new Promise((resolve) => {
    let done = false
    // Map pvIndex → latest (deepest) info line
    const pvMap = new Map<number, PVInfo>()

    const fallbackTimer = setTimeout(() => {
      if (!done) {
        done = true
        console.warn('[engine] bestmove timeout — using random fallback')
        resolve(randomMove(fen))
      }
    }, budgetMs + 4000)

    sf.onmessage = (e: MessageEvent) => {
      const line = typeof e.data === 'string' ? e.data.trim() : ''

      // Collect multi-PV info lines (keep highest-depth entry per pv index)
      if (line.startsWith('info') && line.includes('multipv')) {
        const pv = parsePVLine(line)
        if (pv) {
          const existing = pvMap.get(pv.pvIndex)
          if (!existing || pv.depth >= existing.depth) {
            pvMap.set(pv.pvIndex, pv)
          }
        }
      }

      if (line.startsWith('bestmove') && !done) {
        done = true
        clearTimeout(fallbackTimer)

        const sfBest = line.split(' ')[1]
        if (!sfBest || sfBest === '(none)') {
          resolve(randomMove(fen))
          return
        }

        // Build candidate list ranked by pvIndex (rank 1 = engine best)
        const candidates: CandidateMove[] = []
        for (const [, pv] of pvMap) {
          candidates.push({ uci: pv.move, score: pv.score, rank: pv.pvIndex })
        }
        candidates.sort((a, b) => a.rank - b.rank)

        if (candidates.length === 0) {
          // Fast search returned bestmove before any multipv info — use it directly
          resolve({ bestMove: sfBest, ponder: null })
          return
        }

        const selected = selectFromCandidates(candidates, config, fen, moveNumber)
        resolve({ bestMove: selected || sfBest, ponder: null })
      }
    }

    // Use full engine strength for evaluation; imperfection is applied
    // in selectFromCandidates via randomness, mistakeRate, and style bias.
    sf.postMessage('ucinewgame')
    sf.postMessage(`setoption name MultiPV value ${poolSize}`)
    sf.postMessage('setoption name Skill Level value 20')
    sf.postMessage(`position fen ${fen}`)
    sf.postMessage(`go depth ${depth} movetime ${budgetMs}`)
  })
}

export function terminateEngine() {
  worker?.terminate()
  worker = null
  initPromise = null
}
