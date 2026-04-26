'use client'

import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'
import type { Skill } from '@/types/database'
import { SKILL_CATALOG } from '@/types/skills'
import type { SkillName } from '@/types/skills'

interface SkillRadarProps {
  skills: Skill[]
}

export function SkillRadar({ skills }: SkillRadarProps) {
  const data = skills.map(s => ({
    skill: SKILL_CATALOG[s.skill_name as SkillName]?.label ?? s.skill_name,
    score: Math.round(s.score),
  }))

  if (data.length === 0) return null

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data}>
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis
          dataKey="skill"
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickLine={false}
        />
        <Radar
          name="Score"
          dataKey="score"
          stroke="#0284c7"
          fill="#0ea5e9"
          fillOpacity={0.25}
          strokeWidth={2}
        />
        <Tooltip
          formatter={(v: number) => [`${v}/100`, 'Score']}
          contentStyle={{ borderRadius: '8px', fontSize: '13px' }}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
