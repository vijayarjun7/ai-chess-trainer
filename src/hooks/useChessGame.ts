'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { getBestMove } from '@/lib/chess/engine'
import { defaultOpponentConfig } from '@/lib/chess/opponentConfig'
import type { GameConfig } from '@/types/chess'

export function useChessGame() {
  const store = useGameStore()
  const aiThinking = useRef(false)

  const startGame = useCallback((config: GameConfig) => {
    store.initGame(config)
  }, [store])

  const onPlayerMove = useCallback((from: string, to: string, promotion?: string) => {
    return store.applyMove(from, to, promotion)
  }, [store])

  // Trigger AI move whenever it becomes the AI's turn
  useEffect(() => {
    if (store.isPlayerTurn || store.gameOver || !store.config) return
    if (aiThinking.current) return

    aiThinking.current = true

    const cfg = store.config
    // Use the stored OpponentConfig when available; fall back to level/style derivation
    const opponentConfig = cfg.opponentConfig
      ?? defaultOpponentConfig(cfg.aiLevel, cfg.opponentStyle)

    getBestMove(store.fen, opponentConfig)
      .then(({ bestMove }) => {
        if (bestMove && bestMove !== '(none)') {
          const from  = bestMove.slice(0, 2)
          const to    = bestMove.slice(2, 4)
          const promo = bestMove.length === 5 ? bestMove[4] : undefined
          // Natural-feeling delay: 600–1200 ms
          setTimeout(() => {
            if (!store.gameOver) store.applyMove(from, to, promo)
            aiThinking.current = false
          }, 600 + Math.random() * 600)
        } else {
          aiThinking.current = false
        }
      })
      .catch(err => { console.error(err); aiThinking.current = false })
  }, [store.isPlayerTurn, store.gameOver, store.fen, store.config])

  return {
    fen:          store.fen,
    pgn:          store.pgn,
    moveHistory:  store.moveHistory,
    isPlayerTurn: store.isPlayerTurn,
    gameOver:     store.gameOver,
    result:       store.result,
    config:       store.config,
    gameId:       store.gameId,
    startedAt:    store.startedAt,
    startGame,
    onPlayerMove,
    resetGame:    store.resetGame,
    setGameId:    store.setGameId,
  }
}
