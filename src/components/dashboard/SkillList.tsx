'use client'

import { ProgressBar } from '@/components/ui/ProgressBar'
import { MasteryBadge } from '@/components/ui/Badge'
import type { Skill } from '@/types/database'
import { SKILL_CATALOG } from '@/types/skills'
import type { SkillName } from '@/types/skills'

interface SkillListProps {
  skills: Skill[]
  maxItems?: number
  showWeak?: boolean
}

export function SkillList({ skills, maxItems, showWeak = false }: SkillListProps) {
  let display = [...skills].sort((a, b) =>
    showWeak ? a.score - b.score : b.score - a.score
  )
  if (maxItems) display = display.slice(0, maxItems)

  return (
    <div className="space-y-4">
      {display.map(skill => {
        const meta = SKILL_CATALOG[skill.skill_name as SkillName]
        return (
          <div key={skill.skill_name} className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-800">
                  {meta?.label ?? skill.skill_name}
                </span>
                <MasteryBadge level={skill.mastery_level} />
              </div>
              <ProgressBar value={skill.score} showValue={false} size="sm" />
            </div>
            <span className="text-sm font-bold text-gray-700 w-10 text-right">
              {Math.round(skill.score)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
