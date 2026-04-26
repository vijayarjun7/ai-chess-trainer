'use client'

import { useEffect, useState } from 'react'
import { BoardTrainer } from '@/components/trainer/BoardTrainer'
import { StarSummary } from '@/components/rewards/StarSummary'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useProfile } from '@/hooks/useProfile'
import { evaluateLessonRewards } from '@/lib/rewards/starSystem'
import { SKILL_CATALOG } from '@/types/skills'
import { TRAINER_LESSON_MAP } from '@/lib/lessons/trainerLessons'
import type { TrainerLesson } from '@/types/trainer'
import type { StarReward } from '@/lib/rewards/starSystem'
import type { SkillName } from '@/types/skills'

const CATEGORY_ORDER = ['tactics', 'strategy', 'opening', 'endgame', 'awareness']

const ALL_LESSONS: TrainerLesson[] = Object.entries(TRAINER_LESSON_MAP)
  .sort(([themeA], [themeB]) => {
    const catA = SKILL_CATALOG[themeA as keyof typeof SKILL_CATALOG]?.category ?? 'tactics'
    const catB = SKILL_CATALOG[themeB as keyof typeof SKILL_CATALOG]?.category ?? 'tactics'
    return CATEGORY_ORDER.indexOf(catA) - CATEGORY_ORDER.indexOf(catB)
  })
  .map(([, lesson]) => lesson)

type View = 'list' | 'lesson' | 'rewards'

export default function LessonsPage() {
  const { student } = useProfile()
  const [completedIds,  setCompleted]   = useState<string[]>([])
  const [filter,        setFilter]      = useState<string | null>(null)
  const [activeLesson,  setLesson]      = useState<TrainerLesson | null>(null)
  const [view,          setView]        = useState<View>('list')
  const [rewards,       setRewards]     = useState<StarReward[]>([])
  const [primarySkill,  setPrimary]     = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/lessons')
      .then(r => r.ok ? r.json() : { completedIds: [] })
      .then(d => setCompleted(d.completedIds ?? []))
      .catch(() => {})

    fetch('/api/training/daily-plan')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.plan?.primaryWeakness) setPrimary(d.plan.primaryWeakness) })
      .catch(() => {})
  }, [])

  const handleComplete = (id: string) => {
    setCompleted(prev => prev.includes(id) ? prev : [...prev, id])

    fetch('/api/lessons', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lesson_id: id }),
    }).catch(() => {})

    // Compute star rewards
    if (student && activeLesson) {
      const earned = evaluateLessonRewards({
        lessonTheme:        activeLesson.theme,
        todaysPrimarySkill: (primarySkill ?? null) as SkillName | null,
        age:                student.age,
        skillLevel:         student.skill_level,
        explanationMode:    student.explanation_mode,
      })
      setRewards(earned)
      setView('rewards')
    } else {
      setLesson(null)
      setView('list')
    }
  }

  // ── Lesson player ──────────────────────────────────────────────────────────
  if (view === 'lesson' && activeLesson) {
    return (
      <BoardTrainer
        lesson={activeLesson}
        puzzleTheme={activeLesson.theme}
        onBack={() => { setLesson(null); setView('list') }}
        onComplete={() => handleComplete(activeLesson.id)}
      />
    )
  }

  // ── Post-lesson reward summary ─────────────────────────────────────────────
  if (view === 'rewards' && activeLesson && student) {
    return (
      <div className="page-container pb-20 sm:pb-8 max-w-lg mx-auto">
        <h1 className="section-title">Lesson Complete!</h1>
        <StarSummary
          rewards={rewards}
          age={student.age}
          skillLevel={student.skill_level}
          explanationMode={student.explanation_mode}
          sourceType="lesson"
          nextTarget={
            primarySkill && primarySkill !== activeLesson.theme
              ? `Next, try the ${SKILL_CATALOG[primarySkill as SkillName]?.label ?? primarySkill} puzzles to practise what you learned.`
              : 'Try the puzzles to reinforce this lesson.'
          }
          onContinue={() => { setLesson(null); setView('list') }}
          continueLabel="Back to Lessons"
        />
      </div>
    )
  }

  // ── Lesson list ────────────────────────────────────────────────────────────
  const filtered = filter
    ? ALL_LESSONS.filter(l => {
        const cat = SKILL_CATALOG[l.theme as keyof typeof SKILL_CATALOG]?.category
        return cat === filter
      })
    : ALL_LESSONS

  const doneCount = ALL_LESSONS.filter(l => completedIds.includes(l.id)).length

  const categories = Array.from(
    new Set(ALL_LESSONS.map(l => SKILL_CATALOG[l.theme as keyof typeof SKILL_CATALOG]?.category).filter(Boolean))
  ).sort((a, b) => CATEGORY_ORDER.indexOf(a!) - CATEGORY_ORDER.indexOf(b!))

  return (
    <div className="page-container pb-20 sm:pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title mb-0">Lessons</h1>
          <p className="text-sm text-gray-500 mt-1">{doneCount}/{ALL_LESSONS.length} completed</p>
        </div>
        {doneCount > 0 && <Badge variant="mastered">{doneCount} done</Badge>}
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            !filter ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 hover:border-brand-300'
          }`}
        >
          All ({ALL_LESSONS.length})
        </button>
        {categories.map(cat => {
          const count = ALL_LESSONS.filter(
            l => SKILL_CATALOG[l.theme as keyof typeof SKILL_CATALOG]?.category === cat
          ).length
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat!)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize ${
                filter === cat ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 hover:border-brand-300'
              }`}
            >
              {cat} ({count})
            </button>
          )
        })}
      </div>

      {/* Today's focus hint */}
      {primarySkill && (
        <Card className="mb-4 bg-brand-50 border-brand-100" padding="sm">
          <p className="text-sm text-brand-700">
            🎯 <strong>Today's focus:</strong>{' '}
            {SKILL_CATALOG[primarySkill as SkillName]?.label ?? primarySkill} — the lesson below is recommended.
          </p>
        </Card>
      )}

      {/* Lesson grid */}
      <div className="space-y-3">
        {filtered.map(lesson => {
          const skill   = SKILL_CATALOG[lesson.theme as keyof typeof SKILL_CATALOG]
          const done    = completedIds.includes(lesson.id)
          const isToday = lesson.theme === primarySkill

          return (
            <button
              key={lesson.id}
              onClick={() => { setLesson(lesson); setView('lesson') }}
              className={`w-full text-left bg-white rounded-2xl border shadow-sm px-5 py-4 hover:shadow-md transition-all group ${
                isToday ? 'border-brand-300 ring-1 ring-brand-200' : 'border-gray-100 hover:border-brand-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-gray-900 group-hover:text-brand-700 transition-colors">
                      {lesson.title}
                    </span>
                    {done    && <Badge variant="mastered">Done ✓</Badge>}
                    {isToday && <Badge variant="info">Today's focus</Badge>}
                  </div>
                  {skill && (
                    <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">
                      {skill.category} · {skill.label}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                    {lesson.description}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[11px] bg-brand-50 text-brand-600 border border-brand-100 px-2 py-0.5 rounded-full font-medium">
                      {lesson.steps.length} steps
                    </span>
                    <span className="text-[11px] bg-purple-50 text-purple-600 border border-purple-100 px-2 py-0.5 rounded-full font-medium">
                      {lesson.puzzles.length} puzzles
                    </span>
                    <span className="text-[11px] bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full font-medium">
                      ⭐ Stars
                    </span>
                  </div>
                </div>
                <span className="text-gray-300 group-hover:text-brand-400 transition-colors text-xl shrink-0 mt-0.5">→</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Dismiss rewards if we somehow ended up here with them set */}
      {view === 'rewards' && !activeLesson && (
        <Button className="mt-4" onClick={() => setView('list')}>Back to Lessons</Button>
      )}
    </div>
  )
}
