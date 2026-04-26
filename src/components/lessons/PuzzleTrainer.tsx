'use client'

import { useState, useEffect } from 'react'
import { PuzzleBoard } from '@/components/puzzles/PuzzleBoard'
import type { Puzzle } from '@/types/database'

interface PuzzleTrainerProps {
  theme: string
  studentColor?: 'white' | 'black'
  onComplete?: (correct: number, total: number) => void
}

export function PuzzleTrainer({ theme, studentColor = 'white', onComplete }: PuzzleTrainerProps) {
  const [puzzles, setPuzzles]   = useState<Puzzle[]>([])
  const [index, setIndex]       = useState(0)
  const [results, setResults]   = useState<boolean[]>([])
  const [loading, setLoading]   = useState(true)
  const [advancing, setAdvancing] = useState(false)

  useEffect(() => {
    fetch(`/api/puzzles?theme=${encodeURIComponent(theme)}&limit=5`)
      .then(r => r.json())
      .then(d => { setPuzzles(d.puzzles ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [theme])

  const handleSolved = async (isCorrect: boolean, hintUsed: boolean, timeTaken: number) => {
    if (advancing) return
    setAdvancing(true)

    const puzzle = puzzles[index]
    const newResults = [...results, isCorrect]
    setResults(newResults)

    // Persist attempt
    await fetch('/api/puzzles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        puzzle_id: puzzle.id,
        correct: isCorrect,
        hint_used: hintUsed,
        time_taken_seconds: timeTaken,
        moves_tried: [],
      }),
    }).catch(() => {})

    const correctCount = newResults.filter(Boolean).length

    setTimeout(() => {
      if (index + 1 >= puzzles.length) {
        onComplete?.(correctCount, puzzles.length)
      } else {
        setIndex(i => i + 1)
        setAdvancing(false)
      }
    }, 1600)
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-400 text-sm">Loading puzzles…</div>
  }

  if (puzzles.length === 0) {
    return (
      <div className="text-center py-12 space-y-2">
        <p className="text-gray-500">No puzzles available for this topic yet.</p>
        <p className="text-xs text-gray-400">Check back soon!</p>
      </div>
    )
  }

  const correct = results.filter(Boolean).length
  const done    = results.length >= puzzles.length

  if (done) {
    const pct = Math.round((correct / puzzles.length) * 100)
    return (
      <div className="text-center py-10 space-y-4">
        <div className="text-5xl">{pct >= 80 ? '🏆' : pct >= 60 ? '⭐' : '💪'}</div>
        <p className="text-2xl font-bold text-gray-900">{correct} / {puzzles.length} correct</p>
        <p className="text-gray-500">
          {pct >= 80
            ? 'Excellent — you really understand this concept!'
            : pct >= 60
            ? 'Good effort — keep practising to master it.'
            : 'Every puzzle makes you stronger. Try again!'}
        </p>
        <div className="flex justify-center gap-2 pt-2">
          {results.map((r, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                r ? 'bg-green-500' : 'bg-red-400'
              }`}
            >
              {r ? '✓' : '✗'}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Progress indicators */}
      <div className="flex justify-center gap-2">
        {puzzles.map((_, i) => (
          <div
            key={i}
            className={`h-2.5 flex-1 max-w-[48px] rounded-full transition-colors ${
              i < results.length
                ? results[i] ? 'bg-green-400' : 'bg-red-400'
                : i === index ? 'bg-brand-500' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className="text-center text-xs text-gray-400 font-medium">
        Puzzle {index + 1} of {puzzles.length}
      </p>

      <PuzzleBoard
        key={puzzles[index].id}
        puzzle={puzzles[index]}
        studentColor={studentColor}
        onSolved={handleSolved}
      />
    </div>
  )
}
