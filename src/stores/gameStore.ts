import { create } from 'zustand'
import { Chess } from 'chess.js'
import type { GameConfig } from '@/types/chess'
import type { GameResult } from '@/types/database'

interface GameState {
  // Live game state
  chess: Chess
  fen: string
  pgn: string
  moveHistory: string[]
  isPlayerTurn: boolean
  gameOver: boolean
  result: GameResult | null
  config: GameConfig | null
  gameId: string | null
  startedAt: number | null

  // Actions
  initGame: (config: GameConfig) => void
  applyMove: (from: string, to: string, promotion?: string) => boolean
  setGameOver: (result: GameResult) => void
  setGameId: (id: string) => void
  resetGame: () => void
}

function makeInitialChess() {
  return new Chess()
}

export const useGameStore = create<GameState>((set, get) => ({
  chess: makeInitialChess(),
  fen: new Chess().fen(),
  pgn: '',
  moveHistory: [],
  isPlayerTurn: true,
  gameOver: false,
  result: null,
  config: null,
  gameId: null,
  startedAt: null,

  initGame: (config) => {
    const chess = makeInitialChess()
    set({
      chess,
      fen: chess.fen(),
      pgn: '',
      moveHistory: [],
      isPlayerTurn: config.playerColor === 'white',
      gameOver: false,
      result: null,
      config,
      gameId: null,
      startedAt: Date.now(),
    })
  },

  applyMove: (from, to, promotion = 'q') => {
    const { chess, config } = get()
    if (!config) return false

    try {
      const move = chess.move({ from, to, promotion })
      if (!move) return false

      const isOver = chess.isGameOver()
      let result: GameResult | null = null

      if (isOver) {
        if (chess.isCheckmate()) {
          result = chess.turn() === 'w' ? 'black_wins' : 'white_wins'
        } else {
          result = 'draw'
        }
      }

      const isPlayerTurn = !isOver && chess.turn() === config.playerColor[0]

      set({
        fen: chess.fen(),
        pgn: chess.pgn(),
        moveHistory: chess.history(),
        isPlayerTurn,
        gameOver: isOver,
        result,
      })

      return true
    } catch {
      return false
    }
  },

  setGameOver: (result) => set({ gameOver: true, result }),
  setGameId:   (id)     => set({ gameId: id }),
  resetGame:   ()       => {
    const chess = makeInitialChess()
    set({
      chess, fen: chess.fen(), pgn: '', moveHistory: [],
      isPlayerTurn: true, gameOver: false, result: null,
      config: null, gameId: null, startedAt: null,
    })
  },
}))
