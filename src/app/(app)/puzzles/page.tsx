'use client'

import { useEffect, useState } from 'react'
import { PuzzleBoard } from '@/components/puzzles/PuzzleBoard'
import { StarSummary } from '@/components/rewards/StarSummary'
import { Card, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useProfile } from '@/hooks/useProfile'
import { evaluatePuzzleSetRewards } from '@/lib/rewards/starSystem'
import type { Puzzle } from '@/types/database'
import type { StarReward } from '@/lib/rewards/starSystem'
import { SKILL_CATALOG } from '@/types/skills'
import type { SkillName } from '@/types/skills'

type SessionResult = { correct: number; total: number }

export default function PuzzlesPage() {
  const { student } = useProfile()
  const [puzzles,     setPuzzles]     = useState<Puzzle[]>([])
  const [index,       setIndex]       = useState(0)
  const [focusSkill,  setFocusSkill]  = useState<string | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [session,     setSession]     = useState<SessionResult>({ correct: 0, total: 0 })
  const [lastResult,  setLastResult]  = useState<'correct' | 'incorrect' | null>(null)
  const [rewards,     setRewards]     = useState<StarReward[] | null>(null)
  const [primarySkill, setPrimary]    = useState<string | null>(null)

  // Fetch today's plan once to get primary training skill
  useEffect(() => {
    fetch('/api/training/daily-plan')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.plan?.primaryWeakness) setPrimary(d.plan.primaryWeakness) })
      .catch(() => {})
  }, [])

  const fetchPuzzles = async (theme?: string) => {
    setLoading(true)
    setRewards(null)
    setSession({ correct: 0, total: 0 })
    setLastResult(null)
    const url = theme ? `/api/puzzles?theme=${theme}` : '/api/puzzles'
    const { puzzles: p, focusSkill: fs } = await fetch(url).then(r => r.json())
    setPuzzles(p ?? [])
    setFocusSkill(fs ?? null)
    setIndex(0)
    setLoading(false)
  }

  useEffect(() => { fetchPuzzles() }, [])

  const currentPuzzle = puzzles[index]

  // Build rewards when the session ends
  const buildRewards = (finalSession: SessionResult, skill: string | null) => {
    if (!student) return
    const earned = evaluatePuzzleSetRewards({
      correct:            finalSession.correct,
      total:              finalSession.total,
      focusSkill:         skill,
      todaysPrimarySkill: (primarySkill ?? null) as SkillName | null,
      age:                student.age,
      skillLevel:         student.skill_level,
      explanationMode:    student.explanation_mode,
    })
    setRewards(earned)
  }

  const handleSolved = async (correct: boolean, hintUsed: boolean, timeTaken: number) => {
    setLastResult(correct ? 'correct' : 'incorrect')
    const next: SessionResult = {
      correct: session.correct + (correct ? 1 : 0),
      total:   session.total + 1,
    }
    setSession(next)

    if (!currentPuzzle) return

    await fetch('/api/puzzles/attempt', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        puzzle_id:          currentPuzzle.id,
        correct,
        hint_used:          hintUsed,
        time_taken_seconds: timeTaken,
        moves_tried:        [],
        skill_name:         currentPuzzle.theme,
      }),
    })

    setTimeout(() => {
      setLastResult(null)
      if (index + 1 < puzzles.length) {
        setIndex(i => i + 1)
      } else {
        // Session ended — compute rewards
        buildRewards(next, focusSkill)
      }
    }, 1500)
  }

  if (loading) return (
    <div className="page-container flex items-center justify-center min-h-64">
      <div className="text-center">
        <div className="text-4xl animate-bounce mb-3">🧩</div>
        <p className="text-gray-500">Loading puzzles…</p>
      </div>
    </div>
  )

  return (
    <div className="page-container pb-20 sm:pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title mb-0">Puzzle Trainer</h1>
          {focusSkill && (
            <p className="text-sm text-gray-500 mt-1">
              Focus: {SKILL_CATALOG[focusSkill as SkillName]?.label ?? focusSkill}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info">{session.correct}/{session.total} correct</Badge>
        </div>
      </div>

      {/* Theme filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => fetchPuzzles()}
          className="px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 hover:border-brand-400 hover:text-brand-700 transition-colors"
        >
          Auto (adaptive)
        </button>
        {Object.entries(SKILL_CATALOG).slice(0, 5).map(([key, meta]) => (
          <button
            key={key}
            onClick={() => fetchPuzzles(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              focusSkill === key
                ? 'border-brand-500 bg-brand-50 text-brand-700'
                : 'border-gray-200 hover:border-brand-300'
            }`}
          >
            {meta.label}
          </button>
        ))}
      </div>

      {/* Session complete — show star summary */}
      {!currentPuzzle && rewards !== null && student && (
        <StarSummary
          rewards={rewards}
          age={student.age}
          skillLevel={student.skill_level}
          explanationMode={student.explanation_mode}
          sourceType="puzzle"
          nextTarget={
            primarySkill
              ? `Keep working on ${SKILL_CATALOG[primarySkill as SkillName]?.label ?? primarySkill} — it is today\'s training focus.`
              : 'Try a different puzzle theme to build all-round skills.'
          }
          onContinue={() => fetchPuzzles(focusSkill ?? undefined)}
          continueLabel="More Puzzles"
        />
      )}

      {/* Session complete — no student (unauthenticated) */}
      {!currentPuzzle && rewards === null && (
        <Card>
          <div className="text-center py-8">
            <p className="text-2xl mb-2">🎉</p>
            <CardTitle>All puzzles done!</CardTitle>
            <CardDescription>Great session — {session.correct} out of {session.total} correct.</CardDescription>
            <Button className="mt-4" onClick={() => fetchPuzzles()}>More Puzzles</Button>
          </div>
        </Card>
      )}

      {/* Active puzzle */}
      {currentPuzzle && (
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">
              Puzzle {index + 1} of {puzzles.length}
            </span>
            <div className="flex gap-2">
              <Badge variant="info">
                {SKILL_CATALOG[currentPuzzle.theme as SkillName]?.label ?? currentPuzzle.theme}
              </Badge>
              <Badge>Level {currentPuzzle.difficulty}</Badge>
            </div>
          </div>

          <p className="text-center text-sm text-gray-600 mb-4 font-medium">
            {student?.explanation_mode === 'simple'
              ? 'Find the best move!'
              : 'Find the best continuation for your side.'}
          </p>

          <PuzzleBoard
            puzzle={currentPuzzle}
            studentColor="white"
            onSolved={handleSolved}
          />

          {lastResult && (
            <div className={`mt-4 text-center rounded-xl py-3 font-bold text-lg ${
              lastResult === 'correct' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {lastResult === 'correct' ? 'Nice work!' : 'Keep going!'}
            </div>
          )}

          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setLastResult(null)
                if (index + 1 < puzzles.length) {
                  setIndex(i => i + 1)
                } else {
                  buildRewards(session, focusSkill)
                }
              }}
            >
              Skip this puzzle
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
