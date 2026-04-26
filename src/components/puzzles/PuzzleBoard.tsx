'use client'

import { useState, useCallback } from 'react'
import { Chess } from 'chess.js'
import { ChessBoard } from '@/components/chess/ChessBoard'
import { Button } from '@/components/ui/Button'
import type { Puzzle } from '@/types/database'

interface PuzzleBoardProps {
  puzzle: Puzzle
  studentColor?: 'white' | 'black'
  onSolved: (correct: boolean, hintUsed: boolean, timeTaken: number) => void
}

type PuzzleState = 'idle' | 'solving' | 'correct' | 'incorrect'

export function PuzzleBoard({ puzzle, studentColor = 'white', onSolved }: PuzzleBoardProps) {
  const [chess]          = useState(() => new Chess(puzzle.fen))
  const [fen, setFen]    = useState(puzzle.fen)
  const [state, setState] = useState<PuzzleState>('idle')
  const [hintUsed, setHintUsed] = useState(false)
  const [moveIndex, setMoveIndex] = useState(0)
  const [startTime]      = useState(Date.now())
  const [wrongHighlight, setWrongHighlight] = useState<string[]>([])

  const solutionMoves = puzzle.solution_moves  // UCI array

  const handleMove = useCallback((from: string, to: string) => {
    if (state === 'correct' || state === 'incorrect') return false

    const expected = solutionMoves[moveIndex]
    const played   = from + to

    if (played !== expected) {
      setWrongHighlight([from, to])
      setTimeout(() => setWrongHighlight([]), 800)
      setState('incorrect')
      onSolved(false, hintUsed, Math.round((Date.now() - startTime) / 1000))
      return false
    }

    const moved = chess.move({ from, to, promotion: 'q' })
    if (!moved) return false

    setFen(chess.fen())
    setState('solving')

    const nextIndex = moveIndex + 1

    if (nextIndex >= solutionMoves.length) {
      setState('correct')
      onSolved(true, hintUsed, Math.round((Date.now() - startTime) / 1000))
      return true
    }

    // Play opponent's response after short delay
    const opponentMove = solutionMoves[nextIndex]
    setTimeout(() => {
      chess.move({ from: opponentMove.slice(0, 2), to: opponentMove.slice(2, 4), promotion: 'q' })
      setFen(chess.fen())
      setMoveIndex(nextIndex + 1)
    }, 400)

    return true
  }, [chess, moveIndex, solutionMoves, state, hintUsed, startTime, onSolved])

  const showHint = () => {
    setHintUsed(true)
  }

  return (
    <div className="flex flex-col gap-4 items-center">
      <ChessBoard
        fen={fen}
        playerColor={studentColor}
        onMove={handleMove}
        disabled={state === 'correct' || state === 'incorrect'}
        highlightSquares={wrongHighlight}
      />

      {/* Feedback */}
      {state === 'correct' && (
        <div className="rounded-xl bg-green-50 border border-green-200 px-6 py-3 text-center">
          <p className="text-green-700 font-bold text-lg">Correct!</p>
          {puzzle.explanation && (
            <p className="text-green-600 text-sm mt-1">{puzzle.explanation}</p>
          )}
        </div>
      )}

      {state === 'incorrect' && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-6 py-3 text-center">
          <p className="text-red-700 font-bold text-lg">Not quite!</p>
          {puzzle.explanation && (
            <p className="text-red-600 text-sm mt-1">{puzzle.explanation}</p>
          )}
        </div>
      )}

      {state !== 'correct' && state !== 'incorrect' && hintUsed && puzzle.hint && (
        <div className="rounded-xl bg-yellow-50 border border-yellow-200 px-6 py-3 text-center max-w-sm">
          <p className="text-yellow-800 text-sm">{puzzle.hint}</p>
        </div>
      )}

      {/* Controls */}
      {state !== 'correct' && state !== 'incorrect' && !hintUsed && puzzle.hint && (
        <Button variant="ghost" size="sm" onClick={showHint}>Show hint</Button>
      )}
    </div>
  )
}
