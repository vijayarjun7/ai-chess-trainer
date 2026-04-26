'use client'

import type { TrainerLessonStep as Step } from '@/types/trainer'

interface TrainerLessonStepProps {
  step: Step
  stepNumber: number
  totalSteps: number
  isSpeaking: boolean
}

/** Renders only the scrollable explanation content — nav/voice live in BoardTrainer */
export function TrainerLessonStep({
  step,
  stepNumber,
  totalSteps,
  isSpeaking,
}: TrainerLessonStepProps) {
  return (
    <div className="space-y-4">
      {/* Step counter + progress dots */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-brand-600 uppercase tracking-widest">
          Step {stepNumber} / {totalSteps}
        </span>
        <div className="flex gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i + 1 === stepNumber
                  ? 'w-5 bg-brand-500'
                  : i + 1 < stepNumber
                  ? 'w-2 bg-brand-300'
                  : 'w-2 bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step title */}
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug">
        {step.title}
      </h2>

      {/* Explanation */}
      <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
        {step.explanation}
      </p>

      {/* Coach speech bubble — only when different from explanation */}
      {step.coachSpeech !== step.explanation && (
        <div className="bg-brand-50 border border-brand-100 rounded-2xl px-4 py-3">
          <div className="flex items-start gap-2">
            <span className={`text-lg sm:text-xl shrink-0 mt-0.5 ${isSpeaking ? 'animate-bounce' : ''}`}>
              🤖
            </span>
            <p className="text-brand-800 text-xs sm:text-sm leading-relaxed italic">
              "{step.coachSpeech}"
            </p>
          </div>
        </div>
      )}

      {/* Question prompt */}
      {step.question && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3">
          <div className="flex items-start gap-2">
            <span className="text-lg sm:text-xl shrink-0 mt-0.5">🤔</span>
            <div>
              <p className="text-yellow-900 font-semibold text-xs sm:text-sm mb-1">Your turn!</p>
              <p className="text-yellow-800 text-xs sm:text-sm leading-relaxed">{step.question}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
