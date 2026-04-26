'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import type { AdaptiveRecommendation } from '@/types/skills'

interface RecommendationPanelProps {
  recommendations: AdaptiveRecommendation[]
}

const TYPE_ICON: Record<string, string> = {
  puzzle:     '🧩',
  lesson:     '📖',
  game_focus: '♟️',
}

const TYPE_HREF: Record<string, string> = {
  puzzle:     '/puzzles',
  lesson:     '/lessons',
  game_focus: '/play',
}

const PRIORITY_BADGE: Record<string, 'default' | 'info' | 'learning'> = {
  high:   'learning',
  medium: 'info',
  low:    'default',
}

export function RecommendationPanel({ recommendations }: RecommendationPanelProps) {
  if (recommendations.length === 0) return null

  return (
    <div className="space-y-3">
      {recommendations.map((rec, i) => (
        <Link key={i} href={TYPE_HREF[rec.type]}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer" padding="sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{TYPE_ICON[rec.type]}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-gray-900">{rec.label}</span>
                  <Badge variant={PRIORITY_BADGE[rec.priority]}>
                    {rec.priority === 'high' ? 'Focus now' : rec.priority}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">{rec.reason}</p>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}
