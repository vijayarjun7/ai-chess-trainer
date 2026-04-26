'use client'

import type { StarReward } from '@/lib/rewards/starSystem'
import { CATEGORY_META } from '@/lib/rewards/starSystem'

interface RewardBadgeProps {
  reward: StarReward
  animate?: boolean
}

export function RewardBadge({ reward, animate = true }: RewardBadgeProps) {
  const meta = CATEGORY_META[reward.category]

  return (
    <div
      className={`
        flex items-start gap-3 rounded-2xl border px-4 py-3
        ${meta.color}
        ${animate ? 'animate-in fade-in slide-in-from-bottom-2 duration-300' : ''}
      `}
    >
      {/* Category icon */}
      <span className="text-xl shrink-0 mt-0.5" role="img" aria-label={meta.label}>
        {meta.icon}
      </span>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-bold uppercase tracking-wide opacity-70">
            {meta.label}
          </span>
          {/* Stars */}
          <span className="text-sm leading-none" aria-label={`${reward.stars} stars`}>
            {'⭐'.repeat(reward.stars)}
          </span>
        </div>
        <p className="text-sm leading-snug">{reward.reason}</p>
      </div>
    </div>
  )
}
