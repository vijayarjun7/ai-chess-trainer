'use client'

import { useCallback, useState } from 'react'
import { Chessboard } from 'react-chessboard'
import type { Square } from 'chess.js'
import { Chess } from 'chess.js'
import type { PlayerColor } from '@/types/database'

interface ChessBoardProps {
  fen: string
  playerColor?: PlayerColor
  onMove?: (from: string, to: string, promotion?: string) => boolean
  disabled?: boolean
  highlightSquares?: string[]
  showCoordinates?: boolean
}

export function ChessBoard({
  fen,
  playerColor = 'white',
  onMove,
  disabled = false,
  highlightSquares = [],
  showCoordinates = true,
}: ChessBoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [legalMoves, setLegalMoves] = useState<string[]>([])

  const chess = new Chess(fen)

  const onSquareClick = useCallback((square: Square) => {
    if (disabled) return

    if (selectedSquare && selectedSquare !== square) {
      const moved = onMove?.(selectedSquare, square)
      setSelectedSquare(null)
      setLegalMoves([])
      if (!moved) {
        // Not a valid move — maybe selecting a new piece
        const moves = chess.moves({ square: square as Square, verbose: true })
        if (moves.length > 0) {
          setSelectedSquare(square)
          setLegalMoves(moves.map(m => m.to))
        }
      }
      return
    }

    const moves = chess.moves({ square: square as Square, verbose: true })
    if (moves.length > 0) {
      setSelectedSquare(square)
      setLegalMoves(moves.map(m => m.to))
    } else {
      setSelectedSquare(null)
      setLegalMoves([])
    }
  }, [disabled, selectedSquare, onMove, fen])

  const onPieceDrop = useCallback((source: string, target: string) => {
    const moved = onMove?.(source, target)
    setSelectedSquare(null)
    setLegalMoves([])
    return moved ?? false
  }, [onMove])

  // Build square highlight styles
  const customSquareStyles: Record<string, React.CSSProperties> = {}

  // Highlight king in red when in check
  if (chess.isCheck()) {
    const turn = chess.turn()
    for (const row of chess.board()) {
      for (const cell of row) {
        if (cell?.type === 'k' && cell.color === turn) {
          customSquareStyles[cell.square] = { backgroundColor: 'rgba(220, 38, 38, 0.65)' }
        }
      }
    }
  }

  if (selectedSquare) {
    customSquareStyles[selectedSquare] = { backgroundColor: 'rgba(246, 246, 105, 0.7)' }
  }

  for (const sq of legalMoves) {
    customSquareStyles[sq] = {
      background: 'radial-gradient(circle, rgba(0,0,0,0.15) 25%, transparent 25%)',
    }
  }

  for (const sq of highlightSquares) {
    customSquareStyles[sq] = { backgroundColor: 'rgba(239, 68, 68, 0.5)' }
  }

  return (
    <div className="w-full max-w-[560px] mx-auto select-none">
      <Chessboard
        position={fen}
        boardOrientation={playerColor}
        onSquareClick={onSquareClick}
        onPieceDrop={onPieceDrop}
        customSquareStyles={customSquareStyles}
        showBoardNotation={showCoordinates}
        customBoardStyle={{ borderRadius: '8px', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}
        customDarkSquareStyle={{ backgroundColor: '#b58863' }}
        customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
        arePiecesDraggable={!disabled}
      />
    </div>
  )
}
