'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardTitle } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { DailyCompletionStatus } from './DailyCompletionStatus'
import { DailyTargetList } from './DailyTargetList'
import { motivationalMessage } from '@/lib/training/dailyPlanEvaluator'
import type { DailyPlanWithProgress } from '@/types/training'

interface DailyPlanCardProps {
  age?: number | null
}

export function DailyPlanCard({ age }: DailyPlanCardProps) {
  const [data, setData]         = useState<DailyPlanWithProgress | null>(null)
  const [loading, setLoading]   = useState(true)
  const [refreshing, setRefresh] = useState(false)

  const fetchPlan = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefresh(true)
    try {
      const res = await fetch('/api/training/daily-plan')
      if (!res.ok) return
      const json = await res.json()
      // API returns DailyPlanWithProgress directly
      if (json.plan) setData(json as DailyPlanWithProgress)
    } catch {
      // fail silently — card just won't show
    } finally {
      setLoading(false)
      setRefresh(false)
    }
  }, [])

  useEffect(() => { fetchPlan() }, [fetchPlan])

  if (loading) return <PlanSkeleton />
  if (!data)   return null

  const { plan, progress, overallComplete, completionPercent, nextRecommendation } = data
  const completedTargets = progress.filter(p => p.isComplete).length

  // ── Diagnostic needed: CTA to play first game ─────────────────────────
  if (plan.status === 'diagnostic_needed') {
    return (
      <Card className="border-2 border-dashed border-brand-200 bg-brand-50/40">
        <div className="flex items-start gap-3">
          <span className="text-3xl shrink-0">🎯</span>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base">Start Today's Training</CardTitle>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              Play your <strong>diagnostic game</strong> first. We'll analyse it and build
              a personalised training plan focused on your weakest areas.
            </p>
            <Link
              href="/play"
              className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
            >
              ♟️ Play Diagnostic Game
            </Link>
          </div>
        </div>
      </Card>
    )
  }

  // ── Completed ─────────────────────────────────────────────────────────
  if (plan.status === 'completed' || overallComplete) {
    return (
      <Card className="border-2 border-green-200 bg-green-50/50">
        <div className="flex items-start gap-3 mb-3">
          <span className="text-3xl shrink-0">🏆</span>
          <div>
            <CardTitle className="text-base text-green-800">Daily Goal Complete!</CardTitle>
            <p className="text-sm text-green-700 mt-0.5">
              {age && age <= 9
                ? 'Amazing work today! You are getting stronger every day! 🎉'
                : 'Excellent session — consistent training builds champions.'}
            </p>
          </div>
        </div>
        {nextRecommendation && (
          <p className="text-xs text-gray-500 bg-white rounded-xl px-3 py-2 border border-gray-100">
            💡 {nextRecommendation}
          </p>
        )}
      </Card>
    )
  }

  // ── In progress / repeat needed ──────────────────────────────────────
  const weaknessLabel =
    plan.primaryWeakness
      ? `Focus: ${progress.find(p => p.priority === 'primary')?.skillLabel ?? plan.primaryWeakness}`
      : "Today's Training"

  const motivation = motivationalMessage(age ?? null, completionPercent, overallComplete)

  return (
    <Card padding="sm" className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-2 pt-2">
        <div>
          <CardTitle className="text-base mb-0">📅 Daily Training</CardTitle>
          <p className="text-xs text-gray-500 mt-0.5">{weaknessLabel}</p>
        </div>
        <DailyCompletionStatus
          status={plan.status}
          completionPercent={completionPercent}
          completedTargets={completedTargets}
          totalTargets={plan.targets.length}
        />
      </div>

      {/* Primary target progress bar */}
      {plan.targets.length > 0 && (
        <div className="px-2">
          <ProgressBar
            value={completionPercent}
            label="Primary target"
            color="blue"
            size="sm"
          />
        </div>
      )}

      {/* Motivational message */}
      <p className="px-2 text-xs text-gray-500 italic">{motivation}</p>

      {/* Repeat-needed banner */}
      {plan.status === 'repeat_needed' && (
        <div className="mx-2 rounded-xl bg-orange-50 border border-orange-200 px-3 py-2 text-xs text-orange-700">
          <strong>Yesterday's target not completed.</strong> Keep practising — the
          difficulty has been adjusted to help you succeed today!
        </div>
      )}

      {/* Target list */}
      <div className="px-2 pb-2">
        <DailyTargetList targets={plan.targets} progress={progress} />
      </div>

      {/* Refresh button */}
      <div className="px-2 pb-2 flex justify-end">
        <button
          onClick={() => fetchPlan(true)}
          disabled={refreshing}
          className="text-xs text-gray-400 hover:text-brand-600 transition-colors disabled:opacity-40"
        >
          {refreshing ? 'Refreshing…' : '↻ Refresh progress'}
        </button>
      </div>
    </Card>
  )
}

// ── Loading skeleton ──────────────────────────────────────────────────────

function PlanSkeleton() {
  return (
    <Card padding="sm">
      <div className="animate-pulse space-y-3 p-2">
        <div className="h-4 bg-gray-100 rounded w-40" />
        <div className="h-2 bg-gray-100 rounded w-full" />
        <div className="space-y-2">
          <div className="h-16 bg-gray-50 rounded-xl border border-gray-100" />
          <div className="h-16 bg-gray-50 rounded-xl border border-gray-100" />
        </div>
      </div>
    </Card>
  )
}
