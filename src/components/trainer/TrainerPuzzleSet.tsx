'use client'

import { useState, useCallback } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import type { TrainerPuzzle, PuzzleResult } from '@/types/trainer'

interface TrainerPuzzleSetProps {
  puzzles: TrainerPuzzle[]
  onComplete: (results: PuzzleResult[]) => void
}

type PuzzleState = 'idle' | 'solving' | 'correct' | 'wrong'

function SinglePuzzle({
  puzzle,
  onDone,
}: {
  puzzle: TrainerPuzzle
  onDone: (result: PuzzleResult) => void
}) {
  const [chess] = useState(() => new Chess(puzzle.fen))
  const [fen, setFen] = useState(puzzle.fen)
  const [state, setState] = useState<PuzzleState>('idle')
  const [hintUsed, setHintUsed] = useState(false)
  const [moveIndex, setMoveIndex] = useState(0)
  const [wrongSquares, setWrongSquares] = useState<string[]>([])
  const [startTime] = useState(Date.now())
  const [resultSent, setResultSent] = useState(false)

  const finish = useCallback((correct: boolean, hint: boolean) => {
    if (resultSent) return
    setResultSent(true)
    setTimeout(() => {
      onDone({
        puzzleId: puzzle.id,
        correct,
        hintUsed: hint,
        timeTaken: Math.round((Date.now() - startTime) / 1000),
      })
    }, 1400)
  }, [resultSent, puzzle.id, startTime, onDone])

  const handleMove = useCallback((from: string, to: string): boolean => {
    if (state === 'correct' || state === 'wrong') return false

    const expected = puzzle.solutionMoves[moveIndex]
    const played = from + to

    if (played !== expected) {
      setWrongSquares([from, to])
      setTimeout(() => setWrongSquares([]), 800)
      setState('wrong')
      finish(false, hintUsed)
      return false
    }

    const moved = chess.move({ from, to, promotion: 'q' })
    if (!moved) return false
    setFen(chess.fen())
    setState('solving')

    const next = moveIndex + 1
    if (next >= puzzle.solutionMoves.length) {
      setState('correct')
      finish(true, hintUsed)
      return true
    }

    // Opponent response
    const opp = puzzle.solutionMoves[next]
    setTimeout(() => {
      chess.move({ from: opp.slice(0, 2), to: opp.slice(2, 4), promotion: 'q' })
      setFen(chess.fen())
      setMoveIndex(next + 1)
      setState('idle')
    }, 500)

    return true
  }, [chess, moveIndex, puzzle.solutionMoves, state, hintUsed, finish])

  const squareStyles: Record<string, React.CSSProperties> = {}
  for (const sq of wrongSquares) {
    squareStyles[sq] = { backgroundColor: 'rgba(239,68,68,0.5)' }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full max-w-[420px]">
        <Chessboard
          position={fen}
          boardOrientation={puzzle.playerColor}
          onPieceDrop={(src, tgt) => handleMove(src, tgt)}
          onSquareClick={() => {}}
          customSquareStyles={squareStyles}
          arePiecesDraggable={state !== 'correct' && state !== 'wrong'}
          customBoardStyle={{ borderRadius: '8px', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}
          customDarkSquareStyle={{ backgroundColor: '#b58863' }}
          customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
        />
      </div>

      {state === 'correct' && (
        <div className="w-full max-w-[420px] rounded-2xl bg-green-50 border border-green-200 px-5 py-3 text-center">
          <p className="text-green-700 font-bold text-lg">Correct! 🎉</p>
          <p className="text-green-600 text-sm mt-1">{puzzle.explanation}</p>
        </div>
      )}

      {state === 'wrong' && (
        <div className="w-full max-w-[420px] rounded-2xl bg-red-50 border border-red-200 px-5 py-3 text-center">
          <p className="text-red-700 font-bold text-lg">Not quite! 💪</p>
          <p className="text-red-600 text-sm mt-1">{puzzle.explanation}</p>
        </div>
      )}

      {state === 'idle' && !hintUsed && puzzle.hint && (
        <button
          onClick={() => setHintUsed(true)}
          className="text-sm text-brand-600 underline underline-offset-2 hover:text-brand-800 transition-colors"
        >
          Show hint
        </button>
      )}

      {hintUsed && puzzle.hint && state === 'idle' && (
        <div className="w-full max-w-[420px] rounded-2xl bg-yellow-50 border border-yellow-200 px-5 py-3 text-center">
          <p className="text-yellow-800 text-sm">💡 {puzzle.hint}</p>
        </div>
      )}
    </div>
  )
}

export function TrainerPuzzleSet({ puzzles, onComplete }: TrainerPuzzleSetProps) {
  const [index, setIndex] = useState(0)
  const [results, setResults] = useState<PuzzleResult[]>([])

  const handleDone = (result: PuzzleResult) => {
    const next = [...results, result]
    setResults(next)
    if (index + 1 >= puzzles.length) {
      onComplete(next)
    } else {
      setIndex(i => i + 1)
    }
  }

  const correct = results.filter(r => r.correct).length

  return (
    <div className="space-y-5">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1.5 flex-1">
          {puzzles.map((_, i) => (
            <div
              key={i}
              className={`h-2.5 flex-1 rounded-full transition-colors ${
                i < results.length
                  ? results[i].correct ? 'bg-green-400' : 'bg-red-400'
                  : i === index ? 'bg-brand-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <span className="text-xs font-medium text-gray-500 shrink-0">
          {correct} / {results.length} correct
        </span>
      </div>

      <p className="text-center text-sm font-medium text-gray-600">
        Puzzle {index + 1} of {puzzles.length} — make your move!
      </p>

      <SinglePuzzle
        key={puzzles[index].id}
        puzzle={puzzles[index]}
        onDone={handleDone}
      />
    </div>
  )
}
