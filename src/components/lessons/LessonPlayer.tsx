'use client'

import { useState } from 'react'
import { BoardDemo } from './BoardDemo'
import { VoiceCoach } from './VoiceCoach'
import { PuzzleTrainer } from './PuzzleTrainer'
import type { Lesson } from '@/types/database'

type Phase = 'learn' | 'demo' | 'practice' | 'done'

interface LessonPlayerProps {
  lesson: Lesson
  onComplete?: (lessonId: string) => void
  onBack?: () => void
}

export function LessonPlayer({ lesson, onComplete, onBack }: LessonPlayerProps) {
  const content  = lesson.content
  const hasDemo  = !!(content.fen && content.steps && content.steps.length > 0)
  const phases   = ['learn', ...(hasDemo ? ['demo'] : []), 'practice'] as Phase[]

  const [phase, setPhase]           = useState<Phase>('learn')
  const [voiceText, setVoiceText]   = useState(content.body)
  const [puzzlesDone, setPuzzlesDone] = useState(false)

  const markComplete = async () => {
    await fetch('/api/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lesson_id: lesson.id }),
    }).catch(() => {})
    onComplete?.(lesson.id)
  }

  const handlePuzzlesDone = (correct: number, total: number) => {
    setPuzzlesDone(true)
    setPhase('done')
    markComplete()
  }

  const phaseLabel: Record<string, string> = {
    learn: '📖 Learn',
    demo:  '♟️ Demo',
    practice: '🧩 Practice',
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-24 space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3 min-h-[48px]">
        {onBack && (
          <button
            onClick={onBack}
            className="shrink-0 text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            ← Back
          </button>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-0.5">
            {lesson.theme.replace(/_/g, ' ')}
          </p>
          <h1 className="text-xl font-bold text-gray-900 leading-tight truncate">{lesson.title}</h1>
        </div>
      </div>

      {/* Phase tabs — hidden when done */}
      {phase !== 'done' && (
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {phases.map(p => (
            <button
              key={p}
              onClick={() => setPhase(p)}
              className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                phase === p
                  ? 'bg-white shadow text-brand-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {phaseLabel[p]}
            </button>
          ))}
        </div>
      )}

      {/* ── LEARN ──────────────────────────────────────────────────────────── */}
      {phase === 'learn' && (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <p className="text-gray-800 leading-relaxed flex-1">{content.body}</p>
            <VoiceCoach text={content.body} />
          </div>

          {content.tip && (
            <div className="rounded-xl bg-brand-50 border border-brand-100 px-4 py-3">
              <p className="text-sm text-brand-700">
                <span className="font-semibold">Tip: </span>{content.tip}
              </p>
            </div>
          )}

          <button
            onClick={() => setPhase(hasDemo ? 'demo' : 'practice')}
            className="w-full py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors"
          >
            {hasDemo ? 'See it on the board →' : 'Practice now →'}
          </button>
        </div>
      )}

      {/* ── DEMO ───────────────────────────────────────────────────────────── */}
      {phase === 'demo' && hasDemo && content.steps && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Follow the moves on the board</p>
            <VoiceCoach text={voiceText} />
          </div>

          <BoardDemo
            startFen={content.fen!}
            steps={content.steps}
            onStepChange={(_, text) => setVoiceText(text)}
          />

          <button
            onClick={() => setPhase('practice')}
            className="w-full py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors mt-2"
          >
            Practice puzzles →
          </button>
        </div>
      )}

      {/* ── PRACTICE ───────────────────────────────────────────────────────── */}
      {phase === 'practice' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 text-center">
            Solve 5 puzzles on <span className="font-semibold text-gray-700">{lesson.theme.replace(/_/g, ' ')}</span>
          </p>
          <PuzzleTrainer
            theme={lesson.theme}
            onComplete={handlePuzzlesDone}
          />
        </div>
      )}

      {/* ── DONE ───────────────────────────────────────────────────────────── */}
      {phase === 'done' && (
        <div className="text-center py-10 space-y-5">
          <div className="text-6xl animate-bounce">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900">Lesson Complete!</h2>
          <p className="text-gray-500 max-w-xs mx-auto">
            You finished <span className="font-semibold text-gray-700">"{lesson.title}"</span>. Keep going — every lesson makes you a stronger player!
          </p>
          {onBack && (
            <button
              onClick={onBack}
              className="mt-2 px-8 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors"
            >
              Back to lessons
            </button>
          )}
        </div>
      )}
    </div>
  )
}
