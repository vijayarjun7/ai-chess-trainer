'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { TrainerLessonStep } from './TrainerLessonStep'
import { TrainerVoice } from './TrainerVoice'
import { TrainerPuzzleSet } from './TrainerPuzzleSet'
import { PuzzleTrainer } from '@/components/lessons/PuzzleTrainer'
import type { TrainerLesson, TrainerPhase, PuzzleResult } from '@/types/trainer'

interface BoardTrainerProps {
  lesson: TrainerLesson
  puzzleTheme?: string
  onBack?: () => void
  onComplete?: (results: PuzzleResult[]) => void
}

export function BoardTrainer({ lesson, puzzleTheme, onBack, onComplete }: BoardTrainerProps) {
  const [phase, setPhase]             = useState<TrainerPhase>('lesson')
  const [stepIndex, setStepIndex]     = useState(0)
  const [replayKey, setReplayKey]     = useState(0)
  const [studentMove, setStudentMove] = useState<string | null>(null)
  const [moveResult, setMoveResult]   = useState<'correct' | 'wrong' | null>(null)
  const [puzzleResults, setPuzzleResults] = useState<PuzzleResult[]>([])
  const [autoPlay, setAutoPlay]       = useState(true)
  const [isSpeaking, setIsSpeaking]   = useState(false)

  const stepIndexRef  = useRef(stepIndex)
  const autoPlayRef   = useRef(autoPlay)
  const autoTimer     = useRef<ReturnType<typeof setTimeout> | null>(null)

  stepIndexRef.current = stepIndex
  autoPlayRef.current  = autoPlay

  const step = lesson.steps[stepIndex]
  const isInteractive = phase === 'lesson' && !!step?.question
  const isLast = stepIndex === lesson.steps.length - 1

  const clearTimer = () => {
    if (autoTimer.current) { clearTimeout(autoTimer.current); autoTimer.current = null }
  }

  useEffect(() => () => clearTimer(), [])

  useEffect(() => {
    setStudentMove(null)
    setMoveResult(null)
  }, [stepIndex])

  const advanceStep = useCallback(() => {
    const idx = stepIndexRef.current
    if (idx < lesson.steps.length - 1) {
      setStepIndex(idx + 1)
    } else {
      setPhase('puzzles')
    }
  }, [lesson.steps.length])

  const handleVoiceEnd = useCallback(() => {
    setIsSpeaking(false)
    if (!autoPlayRef.current || lesson.steps[stepIndexRef.current]?.question) return
    autoTimer.current = setTimeout(advanceStep, 1400)
  }, [advanceStep, lesson.steps])

  const handleVoiceStart = useCallback(() => setIsSpeaking(true), [])

  const goNext = useCallback(() => { clearTimer(); advanceStep() }, [advanceStep])

  const goPrev = useCallback(() => {
    clearTimer()
    if (stepIndexRef.current > 0) setStepIndex(i => i - 1)
  }, [])

  const replayStep = useCallback(() => {
    clearTimer()
    setReplayKey(k => k + 1)
    setStudentMove(null)
    setMoveResult(null)
  }, [])

  const handleStudentMove = useCallback((from: string, to: string): boolean => {
    if (!isInteractive || moveResult !== null) return false
    const played   = from + to
    const expected = step.expectedAnswer
    if (expected && played === expected) {
      setStudentMove(played)
      setMoveResult('correct')
      if (autoPlayRef.current) autoTimer.current = setTimeout(advanceStep, 2000)
      return true
    }
    setStudentMove(played)
    setMoveResult('wrong')
    return false
  }, [isInteractive, moveResult, step, advanceStep])

  const handlePuzzlesComplete = (results: PuzzleResult[]) => {
    setPuzzleResults(results)
    setPhase('done')
    onComplete?.(results)
  }

  // ── Board state ────────────────────────────────────────────────────────────
  const displayFen = (() => {
    if (!step) return 'start'
    if (moveResult === 'correct' && step.expectedAnswer) {
      try {
        const c = new Chess(step.fen)
        c.move({ from: step.expectedAnswer.slice(0, 2), to: step.expectedAnswer.slice(2, 4), promotion: 'q' })
        return c.fen()
      } catch { return step.fen }
    }
    return step.fen
  })()

  const squareStyles: Record<string, React.CSSProperties> = {}
  if (phase === 'lesson' && step) {
    for (const sq of step.highlights) squareStyles[sq] = { backgroundColor: 'rgba(59,130,246,0.45)' }
  }
  if (moveResult === 'wrong' && studentMove) {
    squareStyles[studentMove.slice(0, 2)] = { backgroundColor: 'rgba(239,68,68,0.4)' }
    squareStyles[studentMove.slice(2, 4)] = { backgroundColor: 'rgba(239,68,68,0.4)' }
  }
  if (moveResult === 'correct' && step?.expectedAnswer) {
    squareStyles[step.expectedAnswer.slice(0, 2)] = { backgroundColor: 'rgba(34,197,94,0.45)' }
    squareStyles[step.expectedAnswer.slice(2, 4)] = { backgroundColor: 'rgba(34,197,94,0.45)' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const arrows: any[] =
    phase === 'lesson' && step
      ? step.arrows.map(a => [a.from, a.to, a.color ?? '#16a34a'])
      : []

  const correctCount = puzzleResults.filter(r => r.correct).length

  // ── Layout ─────────────────────────────────────────────────────────────────
  // h-dvh: full dynamic viewport (handles iOS Safari toolbar shrinking).
  // Fallback: 100vh via h-screen for older browsers.
  return (
    <div
      className="flex flex-col bg-gray-50 h-screen overflow-hidden"
      style={{ height: '100dvh' }}
    >
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-3 bg-white border-b border-gray-100 shadow-sm">
        {onBack && (
          <button
            onClick={onBack}
            className="shrink-0 p-2 -ml-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Back"
          >
            ←
          </button>
        )}

        <div className="flex-1 min-w-0">
          <p className="hidden sm:block text-[10px] font-semibold text-brand-500 uppercase tracking-widest leading-none mb-0.5">
            {lesson.theme.replace(/_/g, ' ')}
          </p>
          <h1 className="text-sm sm:text-base font-bold text-gray-900 leading-tight truncate">
            {lesson.title}
          </h1>
        </div>

        {/* Auto-play toggle */}
        {phase === 'lesson' && (
          <button
            onClick={() => { clearTimer(); setAutoPlay(v => !v) }}
            title={autoPlay ? 'Auto-play on' : 'Auto-play off'}
            className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              autoPlay
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white text-gray-500 border-gray-200'
            }`}
          >
            <span>{autoPlay ? '▶' : '⏸'}</span>
            <span className="hidden sm:inline">{autoPlay ? 'Auto' : 'Manual'}</span>
          </button>
        )}

        {/* Phase dots */}
        <div className="shrink-0 flex gap-1">
          {(['lesson', 'puzzles', 'done'] as TrainerPhase[]).map(p => (
            <div
              key={p}
              className={`h-1.5 rounded-full transition-all ${
                p === phase ? 'w-5 bg-brand-500'
                : (p === 'puzzles' && (phase === 'puzzles' || phase === 'done')) || (p === 'done' && phase === 'done')
                ? 'w-1.5 bg-brand-300'
                : 'w-1.5 bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── LESSON PHASE ────────────────────────────────────────────────────── */}
      {phase === 'lesson' && step && (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

          {/* Board — capped at ~44vh on mobile so panel always has room */}
          <div className="shrink-0 lg:flex-1 flex items-center justify-center p-2 sm:p-3 lg:p-6 bg-gray-100 lg:bg-gray-50">
            <div
              key={replayKey}
              className="w-full mx-auto lg:max-w-[520px]"
              style={{ maxWidth: 'min(100%, 44dvh, 520px)' }}
            >
              <Chessboard
                position={displayFen}
                arePiecesDraggable={isInteractive && moveResult === null}
                onPieceDrop={(src, tgt) => handleStudentMove(src, tgt)}
                customSquareStyles={squareStyles}
                customArrows={arrows}
                customBoardStyle={{ borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}
                customDarkSquareStyle={{ backgroundColor: '#b58863' }}
                customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
                showBoardNotation
              />

              {/* Status badge */}
              <div className="mt-2 min-h-[28px] flex items-center justify-center">
                {isSpeaking && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 border border-brand-200 rounded-full text-xs font-semibold text-brand-700 animate-pulse">
                    🔊 Explaining…
                  </span>
                )}
                {!isSpeaking && isInteractive && moveResult === null && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-50 border border-yellow-300 rounded-full text-xs font-semibold text-yellow-800">
                    👆 Move a piece!
                  </span>
                )}
                {moveResult === 'correct' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-300 rounded-full text-xs font-semibold text-green-800">
                    ✅ Correct!
                  </span>
                )}
                {moveResult === 'wrong' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-300 rounded-full text-xs font-semibold text-red-800">
                    ❌ Try again —{' '}
                    <button onClick={replayStep} className="underline underline-offset-1">reset</button>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Explanation panel — flex col so content scrolls and footer pins */}
          <div className="flex-1 flex flex-col overflow-hidden lg:w-[400px] lg:flex-none bg-white border-t border-gray-100 lg:border-t-0 lg:border-l">

            {/* Scrollable explanation content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">
              <TrainerLessonStep
                key={stepIndex}
                step={step}
                stepNumber={stepIndex + 1}
                totalSteps={lesson.steps.length}
                isSpeaking={isSpeaking}
              />
            </div>

            {/* Pinned footer: voice + nav */}
            <div className="shrink-0 px-4 sm:px-5 lg:px-6 pt-3 pb-4 sm:pb-5 border-t border-gray-100 bg-white space-y-3">
              <div className="flex items-center justify-between gap-2">
                <TrainerVoice
                  text={step.coachSpeech}
                  autoPlay={autoPlay}
                  onStart={handleVoiceStart}
                  onEnd={handleVoiceEnd}
                />
                {autoPlay && !isSpeaking && !step.question && (
                  <p className="text-[11px] text-gray-400 text-right leading-tight">
                    Auto‑advancing<br className="hidden sm:block" /> after speech…
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={goPrev}
                  disabled={stepIndex === 0}
                  className="flex-1 py-3 sm:py-3.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:border-brand-300 hover:text-brand-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors active:scale-[0.97]"
                >
                  ← Prev
                </button>
                <button
                  onClick={replayStep}
                  className="px-4 py-3 rounded-xl border border-gray-200 text-base font-semibold text-gray-500 hover:border-brand-300 hover:text-brand-700 transition-colors active:scale-[0.97]"
                  title="Replay step"
                >
                  ↺
                </button>
                <button
                  onClick={goNext}
                  className={`flex-1 py-3 sm:py-3.5 rounded-xl text-sm font-semibold transition-colors active:scale-[0.97] ${
                    isLast
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-brand-600 hover:bg-brand-700 text-white'
                  }`}
                >
                  {isLast ? 'Puzzles →' : 'Next →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PUZZLES PHASE ───────────────────────────────────────────────────── */}
      {phase === 'puzzles' && (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-xl mx-auto px-4 py-6 sm:py-8">
            <div className="mb-5 text-center">
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Practice Time! 🧩</p>
              <p className="text-gray-500 text-sm">
                Solve puzzles on{' '}
                <span className="font-semibold text-gray-700">{lesson.theme.replace(/_/g, ' ')}</span>
              </p>
            </div>

            {lesson.puzzles.length > 0 ? (
              <TrainerPuzzleSet puzzles={lesson.puzzles} onComplete={handlePuzzlesComplete} />
            ) : (puzzleTheme ?? lesson.theme) ? (
              <PuzzleTrainer
                theme={puzzleTheme ?? lesson.theme}
                onComplete={(correct, total) => {
                  const fakeResults: PuzzleResult[] = Array.from({ length: total }, (_, i) => ({
                    puzzleId: `p-${i}`,
                    correct: i < correct,
                    hintUsed: false,
                    timeTaken: 0,
                  }))
                  handlePuzzlesComplete(fakeResults)
                }}
              />
            ) : (
              <div className="text-center py-10 space-y-4">
                <p className="text-gray-500">Great job completing all the steps!</p>
                <button
                  onClick={() => handlePuzzlesComplete([])}
                  className="px-8 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors"
                >
                  Finish →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── DONE ────────────────────────────────────────────────────────────── */}
      {phase === 'done' && (
        <div className="flex-1 overflow-y-auto flex items-center justify-center px-4 py-8">
          <div className="max-w-sm w-full text-center space-y-5">
            <div className="text-6xl sm:text-7xl">
              {correctCount >= lesson.puzzles.length * 0.8 ? '🏆'
                : correctCount >= lesson.puzzles.length * 0.6 ? '⭐'
                : '💪'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Lesson Complete!</h2>
            <p className="text-gray-500 text-base sm:text-lg">
              You solved{' '}
              <span className="font-bold text-gray-800">{correctCount} of {lesson.puzzles.length || puzzleResults.length}</span>{' '}
              puzzles correctly.
            </p>
            {puzzleResults.length > 0 && (
              <div className="flex justify-center gap-2 flex-wrap">
                {puzzleResults.map((r, i) => (
                  <div
                    key={i}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      r.correct ? 'bg-green-500' : 'bg-red-400'
                    }`}
                  >
                    {r.correct ? '✓' : '✗'}
                  </div>
                ))}
              </div>
            )}
            <p className="text-gray-400 text-sm">
              {correctCount >= (lesson.puzzles.length || puzzleResults.length) * 0.8
                ? 'Excellent! You really get this concept.'
                : correctCount >= (lesson.puzzles.length || puzzleResults.length) * 0.6
                ? "Good work! Keep practising to master it."
                : 'Every puzzle makes you stronger — keep going!'}
            </p>
            {onBack && (
              <button
                onClick={onBack}
                className="w-full py-3.5 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors text-base sm:text-lg active:scale-[0.97]"
              >
                Back to Lessons
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
