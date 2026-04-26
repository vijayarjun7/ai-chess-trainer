'use client'

import Link from 'next/link'
import type { DailyTarget, TargetProgress } from '@/types/training'

interface DailyTargetListProps {
  targets:  DailyTarget[]
  progress: TargetProgress[]
}

const PRIORITY_LABEL: Record<string, string> = {
  primary:   'Primary',
  secondary: 'Secondary',
  bonus:     'Bonus',
}

const PRIORITY_RING: Record<string, string> = {
  primary:   'border-brand-400 bg-brand-50',
  secondary: 'border-purple-300 bg-purple-50',
  bonus:     'border-gray-200 bg-gray-50',
}

const PRIORITY_BADGE: Record<string, string> = {
  primary:   'bg-brand-100 text-brand-700',
  secondary: 'bg-purple-100 text-purple-700',
  bonus:     'bg-gray-100 text-gray-600',
}

export function DailyTargetList({ targets, progress }: DailyTargetListProps) {
  if (targets.length === 0) return null

  return (
    <div className="space-y-3">
      {targets.map(target => {
        const p = progress.find(x => x.targetId === target.id)
        return (
          <TargetRow key={target.id} target={target} progress={p} />
        )
      })}
    </div>
  )
}

// ── Single target row ─────────────────────────────────────────────────────

function TargetRow({
  target,
  progress,
}: {
  target: DailyTarget
  progress: TargetProgress | undefined
}) {
  const isComplete = progress?.isComplete ?? false

  return (
    <div className={`rounded-2xl border-2 p-4 transition-all ${
      isComplete
        ? 'border-green-300 bg-green-50'
        : PRIORITY_RING[target.priority]
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${PRIORITY_BADGE[target.priority]}`}>
            {PRIORITY_LABEL[target.priority]}
          </span>
          <span className="font-semibold text-sm text-gray-900">{target.skillLabel}</span>
        </div>
        {isComplete ? (
          <span className="text-green-600 text-lg">✅</span>
        ) : (
          <span className="text-xs text-gray-400 font-medium">
            Score {target.skillScoreAtStart}
          </span>
        )}
      </div>

      {/* Activity rows */}
      <div className="space-y-2">
        {/* Lesson */}
        {target.lessonTheme && (
          <ActivityRow
            icon="📖"
            label="Study lesson"
            done={progress?.lessonCompleted ?? false}
            href="/lessons"
            actionLabel="Study"
          />
        )}

        {/* Puzzles */}
        <ActivityRow
          icon="🧩"
          label={`Solve puzzles — ${progress?.puzzlesCorrect ?? 0}/${target.puzzlePassThreshold} correct`}
          done={(progress?.puzzlesCorrect ?? 0) >= target.puzzlePassThreshold}
          href={`/puzzles?theme=${target.skill}`}
          actionLabel="Practise"
          extra={
            (progress?.puzzlesAttempted ?? 0) > 0
              ? `${progress!.puzzleAccuracy}% accuracy`
              : undefined
          }
        />

        {/* Focused game */}
        {target.focusedGameRequired && (
          <ActivityRow
            icon="♟️"
            label="Play a focused game"
            done={(progress?.gamesPlayedToday ?? 0) > 0}
            href={`/play?focus=${target.skill}`}
            actionLabel="Play"
          />
        )}
      </div>

      {/* Remaining hint */}
      {!isComplete && progress && progress.activitiesRemaining.length > 0 && (
        <p className="mt-3 text-xs text-gray-400 leading-relaxed">
          Next: {progress.activitiesRemaining[0]}
        </p>
      )}
    </div>
  )
}

// ── Activity row ──────────────────────────────────────────────────────────

function ActivityRow({
  icon,
  label,
  done,
  href,
  actionLabel,
  extra,
}: {
  icon: string
  label: string
  done: boolean
  href: string
  actionLabel: string
  extra?: string
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <span className={`text-base shrink-0 ${done ? 'opacity-50' : ''}`}>{icon}</span>
        <span className={`text-xs leading-snug truncate ${done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
          {label}
        </span>
        {extra && !done && (
          <span className="text-[10px] text-gray-400 shrink-0">{extra}</span>
        )}
      </div>
      {done ? (
        <span className="text-green-500 text-sm shrink-0">✓</span>
      ) : (
        <Link
          href={href}
          className="shrink-0 text-xs font-semibold text-brand-600 hover:text-brand-800 px-2.5 py-1 rounded-lg bg-white border border-brand-200 hover:border-brand-400 transition-colors"
        >
          {actionLabel} →
        </Link>
      )}
    </div>
  )
}
