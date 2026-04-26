'use client'

import { Button } from '@/components/ui/Button'
import type { GameResult, OpponentStyle } from '@/types/database'
import { OPPONENT_PERSONALITIES } from '@/types/chess'

interface GameControlsProps {
  isPlayerTurn: boolean
  gameOver: boolean
  result: GameResult | null
  aiLevel: number
  opponentStyle: OpponentStyle
  onResign: () => void
  onNewGame: () => void
  onAnalyse: () => void
}

const RESULT_LABEL: Record<GameResult, string> = {
  white_wins:  'White wins!',
  black_wins:  'Black wins!',
  draw:        'Draw!',
  abandoned:   'Game ended',
}

export function GameControls({
  isPlayerTurn,
  gameOver,
  result,
  aiLevel,
  opponentStyle,
  onResign,
  onNewGame,
  onAnalyse,
}: GameControlsProps) {
  const personality = OPPONENT_PERSONALITIES[opponentStyle]

  return (
    <div className="flex flex-col gap-3">
      {/* Status */}
      <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 text-center">
        {gameOver ? (
          <p className="font-bold text-gray-900 text-lg">{result ? RESULT_LABEL[result] : 'Game over'}</p>
        ) : (
          <p className="text-gray-700">
            {isPlayerTurn ? '🟢 Your turn' : '🤔 AI thinking…'}
          </p>
        )}
      </div>

      {/* Opponent info */}
      <div className="rounded-xl bg-brand-50 border border-brand-100 px-4 py-3 text-sm">
        <p className="font-semibold text-brand-800">Opponent: {personality.description}</p>
        <p className="text-brand-600">Level {aiLevel} · {opponentStyle}</p>
      </div>

      {/* Actions */}
      {!gameOver ? (
        <Button variant="danger" size="sm" onClick={onResign}>Resign</Button>
      ) : (
        <div className="flex gap-2">
          <Button variant="primary" size="sm" className="flex-1" onClick={onAnalyse}>
            Analyse Game
          </Button>
          <Button variant="secondary" size="sm" className="flex-1" onClick={onNewGame}>
            New Game
          </Button>
        </div>
      )}
    </div>
  )
}
