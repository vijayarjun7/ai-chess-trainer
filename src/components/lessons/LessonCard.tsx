'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import type { Lesson } from '@/types/database'

interface LessonCardProps {
  lesson: Lesson
  completed?: boolean
  onComplete?: (lessonId: string) => void
}

export function LessonCard({ lesson, completed = false, onComplete }: LessonCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null)

  const content = lesson.content
  const hasQuiz = content.type === 'quiz' && content.quiz

  return (
    <Card className="transition-all">
      {/* Header */}
      <div
        className="flex items-start justify-between cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
            {completed && <Badge variant="mastered">Done</Badge>}
          </div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">{lesson.theme}</p>
        </div>
        <span className="text-gray-400 text-lg">{expanded ? '▲' : '▼'}</span>
      </div>

      {/* Content */}
      {expanded && (
        <div className="mt-4 space-y-4">
          <p className="text-gray-700 leading-relaxed">{content.body}</p>

          {content.tip && (
            <div className="rounded-xl bg-brand-50 border border-brand-100 px-4 py-3">
              <p className="text-sm text-brand-700">
                <span className="font-semibold">Tip: </span>{content.tip}
              </p>
            </div>
          )}

          {hasQuiz && content.quiz && (
            <div className="space-y-2">
              <p className="font-medium text-gray-800">{content.quiz.question}</p>
              {content.quiz.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setQuizAnswer(i)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-colors ${
                    quizAnswer === null
                      ? 'border-gray-200 hover:border-brand-400 hover:bg-brand-50'
                      : i === content.quiz!.correct_index
                      ? 'border-green-400 bg-green-50 text-green-700'
                      : quizAnswer === i
                      ? 'border-red-300 bg-red-50 text-red-700'
                      : 'border-gray-200 text-gray-500'
                  }`}
                >
                  {opt}
                </button>
              ))}
              {quizAnswer !== null && (
                <p className={`text-sm font-medium ${
                  quizAnswer === content.quiz.correct_index ? 'text-green-600' : 'text-red-600'
                }`}>
                  {quizAnswer === content.quiz.correct_index ? 'Correct! Great job.' : 'Not quite — review the lesson and try again.'}
                </p>
              )}
            </div>
          )}

          {!completed && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onComplete?.(lesson.id)}
            >
              Mark as done
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}
