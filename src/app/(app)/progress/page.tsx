'use client'

import { useEffect, useState } from 'react'
import { Card, CardTitle, CardDescription } from '@/components/ui/Card'
import { SkillList } from '@/components/dashboard/SkillList'
import { SkillRadar } from '@/components/dashboard/SkillRadar'
import { RecommendationPanel } from '@/components/dashboard/RecommendationPanel'
import { Badge } from '@/components/ui/Badge'
import type { Skill } from '@/types/database'
import type { AdaptiveRecommendation } from '@/types/skills'

export default function ProgressPage() {
  const [skills, setSkills]           = useState<Skill[]>([])
  const [recommendations, setRecs]    = useState<AdaptiveRecommendation[]>([])
  const [loading, setLoading]         = useState(true)
  const [activeTab, setActiveTab]     = useState<'overview' | 'strengths' | 'weaknesses'>('overview')

  useEffect(() => {
    fetch('/api/skills')
      .then(r => r.json())
      .then(({ skills: s, recommendations: r }) => {
        setSkills(s ?? [])
        setRecs(r ?? [])
      })
      .finally(() => setLoading(false))
  }, [])

  const avgScore = skills.length
    ? Math.round(skills.reduce((s, k) => s + k.score, 0) / skills.length)
    : 0

  const masteredCount  = skills.filter(s => s.mastery_level === 'mastered').length
  const learningCount  = skills.filter(s => s.mastery_level === 'learning').length

  if (loading) return (
    <div className="page-container flex items-center justify-center min-h-64">
      <div className="text-center">
        <div className="text-4xl animate-bounce mb-3">📊</div>
        <p className="text-gray-500">Loading your progress…</p>
      </div>
    </div>
  )

  return (
    <div className="page-container pb-20 sm:pb-8">
      <h1 className="section-title">Your Progress</h1>
      <p className="section-sub">Track skill-by-skill improvement</p>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Avg Score', value: avgScore, suffix: '/100' },
          { label: 'Mastered',  value: masteredCount, suffix: ' skills' },
          { label: 'Learning',  value: learningCount,  suffix: ' skills' },
        ].map(stat => (
          <Card key={stat.label} className="text-center" padding="sm">
            <p className="text-2xl font-extrabold text-brand-700">{stat.value}<span className="text-sm font-normal text-gray-400">{stat.suffix}</span></p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-100">
        {(['overview', 'strengths', 'weaknesses'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 px-1 text-sm font-medium capitalize border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardTitle>Skill Radar</CardTitle>
            <CardDescription>All skills at a glance</CardDescription>
            <div className="mt-2">
              <SkillRadar skills={skills} />
            </div>
          </Card>
          <Card>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>Adaptive recommendations</CardDescription>
            <div className="mt-4">
              <RecommendationPanel recommendations={recommendations} />
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'strengths' && (
        <Card>
          <CardTitle>Your Strongest Skills</CardTitle>
          <CardDescription>Keep building on these!</CardDescription>
          <div className="mt-4">
            <SkillList skills={skills} showWeak={false} />
          </div>
        </Card>
      )}

      {activeTab === 'weaknesses' && (
        <Card>
          <CardTitle>Areas to Improve</CardTitle>
          <CardDescription>These need the most attention</CardDescription>
          <div className="mt-4">
            <SkillList skills={skills} showWeak={true} />
          </div>
        </Card>
      )}
    </div>
  )
}
