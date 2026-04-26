'use client'

import type { StarReward } from '@/lib/rewards/starSystem'
import { totalStars, encouragingMessage } from '@/lib/rewards/starSystem'
import { RewardBadge } from './RewardBadge'
import type { ExplanationMode, SkillLevel } from '@/types/database'
import { Button } from '@/components/ui/Button'

interface StarSummaryProps {
  rewards:         StarReward[]
  age?:            number | null
  skillLevel?:     SkillLevel
  explanationMode: ExplanationMode
  sourceType:      'game' | 'puzzle' | 'lesson' | 'daily_plan'
  nextTarget?:     string | null
  onContinue?:     () => void
  continueLabel?:  string
  /** Optional result header line: e.g. "Game Result: Lost" */
  resultLine?:     string
}

export function StarSummary({
  rewards,
  age,
  explanationMode,
  sourceType,
  nextTarget,
  onContinue,
  continueLabel = 'Continue',
  resultLine,
}: StarSummaryProps) {
  const total   = totalStars(rewards)
  const message = encouragingMessage(total, age ?? null, explanationMode, sourceType)

  const isYoung  = explanationMode === 'simple' || (age !== null && age !== undefined && age <= 8)
  const isAdult  = !isYoung && explanationMode === 'advanced'

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={`rounded-2xl px-5 py-4 text-center ${
        total >= 5 ? 'bg-amber-50 border border-amber-200'
        : total >= 3 ? 'bg-brand-50 border border-brand-100'
        : 'bg-gray-50 border border-gray-100'
      }`}>
        {/* Result line */}
        {resultLine && (
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
            {resultLine}
          </p>
        )}

        {/* Star count */}
        <div className="flex items-center justify-center gap-2 mb-1">
          {total > 0 ? (
            <>
              <span
                className={`font-extrabold ${
                  isYoung ? 'text-5xl' : isAdult ? 'text-3xl' : 'text-4xl'
                } text-amber-500`}
              >
                {total}
              </span>
              <span className={`${isYoung ? 'text-3xl' : 'text-xl'}`}>
                ⭐{isYoung && total > 1 ? '⭐'.repeat(Math.min(total - 1, 4)) : ''}
              </span>
            </>
          ) : (
            <span className={`font-bold text-gray-400 ${isYoung ? 'text-2xl' : 'text-xl'}`}>
              0 stars
            </span>
          )}
        </div>

        {!isAdult && (
          <p className="text-xs text-gray-500 mb-2">
            {total === 1 ? '1 star earned' : `${total} stars earned`}
          </p>
        )}

        {/* Encouraging message */}
        <p className={`font-medium ${isYoung ? 'text-base' : 'text-sm'} text-gray-700 leading-snug`}>
          {message}
        </p>
      </div>

      {/* Reward badges */}
      {rewards.length > 0 && (
        <div className="space-y-2">
          {rewards.map((r, i) => (
            <RewardBadge
              key={`${r.category}-${i}`}
              reward={r}
              animate
            />
          ))}
        </div>
      )}

      {/* No rewards placeholder */}
      {rewards.length === 0 && (
        <div className="text-center py-4 text-gray-400 text-sm">
          {isYoung
            ? 'Try your best next time to earn stars! 💙'
            : 'Complete activities to earn stars.'}
        </div>
      )}

      {/* Next target */}
      {nextTarget && (
        <div className="rounded-xl bg-white border border-gray-100 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
            {isYoung ? 'Next step 🚀' : 'Next target'}
          </p>
          <p className="text-sm text-gray-700 leading-snug">{nextTarget}</p>
        </div>
      )}

      {/* Continue */}
      {onContinue && (
        <Button className="w-full" onClick={onContinue}>
          {continueLabel}
        </Button>
      )}
    </div>
  )
}
