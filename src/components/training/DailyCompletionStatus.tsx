'use client'

import type { DailyPlanStatus } from '@/types/training'

interface DailyCompletionStatusProps {
  status: DailyPlanStatus
  completionPercent: number
  completedTargets: number
  totalTargets: number
}

const STATUS_CONFIG: Record<
  DailyPlanStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  diagnostic_needed: {
    label: 'Diagnostic needed',
    bg:    'bg-gray-100',
    text:  'text-gray-600',
    dot:   'bg-gray-400',
  },
  in_progress: {
    label: 'In progress',
    bg:    'bg-brand-50',
    text:  'text-brand-700',
    dot:   'bg-brand-500',
  },
  completed: {
    label: 'Completed!',
    bg:    'bg-green-50',
    text:  'text-green-700',
    dot:   'bg-green-500',
  },
  repeat_needed: {
    label: 'Keep trying',
    bg:    'bg-orange-50',
    text:  'text-orange-700',
    dot:   'bg-orange-400',
  },
}

export function DailyCompletionStatus({
  status,
  completionPercent,
  completedTargets,
  totalTargets,
}: DailyCompletionStatusProps) {
  const cfg = STATUS_CONFIG[status]

  return (
    <div className="flex items-center gap-3">
      {/* Status pill */}
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {cfg.label}
      </span>

      {/* Progress fraction — only when a plan is active */}
      {status !== 'diagnostic_needed' && totalTargets > 0 && (
        <span className="text-xs text-gray-400 font-medium">
          {completedTargets}/{totalTargets} targets
        </span>
      )}

      {/* Percent ring for in_progress */}
      {status === 'in_progress' && completionPercent > 0 && (
        <span className="text-xs font-bold text-brand-600">{completionPercent}%</span>
      )}
    </div>
  )
}
