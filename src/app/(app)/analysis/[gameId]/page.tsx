'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CoachChat } from '@/components/coach/CoachChat'
import { StarSummary } from '@/components/rewards/StarSummary'
import { useProfile } from '@/hooks/useProfile'
import { evaluateGameRewards } from '@/lib/rewards/starSystem'
import type { GameAnalysis } from '@/types/database'
import type { CoachingFeedback, MoveSummary } from '@/lib/ai/types'
import type { StarReward } from '@/lib/rewards/starSystem'
import { SKILL_CATALOG } from '@/types/skills'
import type { SkillName } from '@/types/skills'

type Tab = 'stars' | 'feedback' | 'moves' | 'mistakes' | 'chat'

const MOVE_COLORS: Record<MoveSummary['classification'], string> = {
  best:       'bg-green-50  text-green-700  border-green-200',
  inaccuracy: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  mistake:    'bg-orange-50 text-orange-700 border-orange-200',
  blunder:    'bg-red-50    text-red-700    border-red-200',
}
const MOVE_SYMBOL: Record<MoveSummary['classification'], string> = {
  best: '', inaccuracy: '?!', mistake: '?', blunder: '??',
}

export default function AnalysisPage() {
  const { gameId } = useParams<{ gameId: string }>()
  const { student } = useProfile()

  const [analysis,  setAnalysis]  = useState<GameAnalysis | null>(null)
  const [feedback,  setFeedback]  = useState<CoachingFeedback | null>(null)
  const [rewards,   setRewards]   = useState<StarReward[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('stars')

  useEffect(() => {
    if (!gameId) return

    const run = async () => {
      const existing = await fetch(`/api/analysis?game_id=${gameId}`).then(r => r.json())

      // Use cached analysis only when it has coaching_feedback (fully analysed record).
      // Old records without it fall through to re-POST so they get updated.
      if (existing.analysis?.coaching_feedback) {
        setAnalysis(existing.analysis)
        setFeedback(existing.analysis.coaching_feedback)
        setLoading(false)
        return
      }

      const res = await fetch('/api/analysis', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: gameId, player_color: 'white' }),
      })
      if (!res.ok) { setError('Could not analyse this game.'); setLoading(false); return }

      const data = await res.json()
      setAnalysis(data.analysis)
      setFeedback(data.feedback)
      setLoading(false)
    }

    run().catch(() => { setError('Something went wrong.'); setLoading(false) })
  }, [gameId, student])

  // Compute rewards once analysis and student are available
  useEffect(() => {
    if (!analysis || !student) return

    // Fetch today's plan to get the primary training skill
    fetch('/api/training/daily-plan')
      .then(r => r.ok ? r.json() : null)
      .then(planData => {
        const primarySkill = planData?.plan?.primaryWeakness ?? null

        const earned = evaluateGameRewards({
          gameResult:         analysis.blunders.length === 0 && analysis.mistakes.length === 0
                                ? null  // can't determine result from analysis alone
                                : null, // result comes from game record, not analysis
          playerColor:        'white',
          blundersThisGame:   analysis.blunders.length,
          mistakesThisGame:   analysis.mistakes.length,
          skillTags:          analysis.skill_tags,
          moveCount:          analysis.blunders.length + analysis.mistakes.length + 20,
          todaysPrimarySkill: primarySkill,
          age:                student.age,
          skillLevel:         student.skill_level,
          explanationMode:    student.explanation_mode,
        })
        setRewards(earned)
      })
      .catch(() => {
        // Compute without daily plan context
        const earned = evaluateGameRewards({
          gameResult:         null,
          playerColor:        'white',
          blundersThisGame:   analysis.blunders.length,
          mistakesThisGame:   analysis.mistakes.length,
          skillTags:          analysis.skill_tags,
          moveCount:          30,
          todaysPrimarySkill: null,
          age:                student.age,
          skillLevel:         student.skill_level,
          explanationMode:    student.explanation_mode,
        })
        setRewards(earned)
      })
  }, [analysis, student])

  if (loading) return (
    <div className="page-container flex items-center justify-center min-h-64">
      <div className="text-center">
        <div className="text-4xl animate-bounce mb-3">♟️</div>
        <p className="text-gray-500">Analysing your game…</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="page-container">
      <Card><p className="text-red-600">{error}</p></Card>
    </div>
  )

  const tabs: { id: Tab; label: string; short: string }[] = [
    { id: 'stars',    label: '⭐ Stars',   short: '⭐' },
    { id: 'feedback', label: 'Feedback',   short: 'Feedback' },
    { id: 'moves',    label: 'Moves',      short: 'Moves' },
    { id: 'mistakes', label: 'Mistakes',   short: 'Errors' },
    { id: 'chat',     label: 'Ask Coach',  short: 'Coach' },
  ]

  return (
    <div className="page-container pb-20 sm:pb-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title mb-0">Game Review</h1>
        <Link href="/play">
          <Button variant="secondary" size="sm">New Game</Button>
        </Link>
      </div>

      {/* Skill tags */}
      {analysis?.skill_tags && analysis.skill_tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {analysis.skill_tags.map(tag => (
            <Badge key={tag} variant="info" size="md">
              {SKILL_CATALOG[tag as SkillName]?.label ?? tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex mb-4 border-b border-gray-100 overflow-x-auto scrollbar-none">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2 px-2.5 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex-1 sm:flex-none ${
              activeTab === tab.id
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="sm:hidden">{tab.short}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Stars tab */}
      {activeTab === 'stars' && student && (
        <StarSummary
          rewards={rewards}
          age={student.age}
          skillLevel={student.skill_level}
          explanationMode={student.explanation_mode}
          sourceType="game"
          nextTarget={feedback?.nextGameFocus ?? null}
        />
      )}
      {activeTab === 'stars' && !student && (
        <Card>
          <p className="text-gray-500 text-sm text-center py-4">
            Sign in to see your earned stars.
          </p>
        </Card>
      )}

      {/* Feedback tab */}
      {activeTab === 'feedback' && feedback && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="md:col-span-2 bg-brand-50 border-brand-100">
            <CardTitle>Summary</CardTitle>
            <p className="text-gray-700 mt-2">{feedback.quickSummary}</p>
          </Card>

          <Card className="border-red-100 bg-red-50">
            <CardTitle>Main Problem</CardTitle>
            <p className="text-gray-700 mt-2 text-sm">{feedback.mainProblem}</p>
          </Card>

          <Card className="border-green-100 bg-green-50">
            <CardTitle>What You Did Well</CardTitle>
            <p className="text-gray-700 mt-2 text-sm">{feedback.doneWell}</p>
          </Card>

          <Card className="border-yellow-100 bg-yellow-50">
            <CardTitle>Next Game Focus</CardTitle>
            <p className="text-gray-700 mt-2 text-sm">{feedback.nextGameFocus}</p>
          </Card>

          <Card>
            <CardTitle>Training Plan</CardTitle>
            <ul className="mt-2 space-y-2">
              {feedback.trainingPlan.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-brand-500 font-bold mt-0.5">{i + 1}.</span>
                  {item}
                </li>
              ))}
            </ul>
          </Card>

          {feedback.assumptionsNote && (
            <p className="text-xs text-gray-400 md:col-span-2">{feedback.assumptionsNote}</p>
          )}
        </div>
      )}
      {activeTab === 'feedback' && !feedback && (
        <Card>
          <p className="text-gray-500 text-sm text-center py-4">Feedback not available for this game.</p>
        </Card>
      )}

      {/* Moves tab */}
      {activeTab === 'moves' && feedback?.moveList && (
        <div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {(['best', 'inaccuracy', 'mistake', 'blunder'] as const).map(c => (
              <span key={c} className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${MOVE_COLORS[c]}`}>
                {c}{MOVE_SYMBOL[c] ? ` ${MOVE_SYMBOL[c]}` : ''}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {feedback.moveList.map((mv, i) => {
              const isPair = mv.ply % 2 === 0
              return (
                <span key={i} className="inline-flex items-center gap-0.5">
                  {isPair && (
                    <span className="text-[11px] text-gray-400 font-mono w-5 text-right shrink-0">
                      {mv.move_number}.
                    </span>
                  )}
                  <span
                    title={mv.description ?? ''}
                    className={`text-xs font-mono px-1.5 py-0.5 rounded border font-medium cursor-default ${MOVE_COLORS[mv.classification]}`}
                  >
                    {mv.san}{MOVE_SYMBOL[mv.classification]}
                  </span>
                </span>
              )
            })}
          </div>
          {feedback.moveList.some(m => m.classification !== 'best') && (
            <div className="mt-4 space-y-2">
              {feedback.moveList.filter(m => m.description).map((mv, i) => (
                <div key={i} className={`rounded-xl border px-3 py-2 text-sm ${MOVE_COLORS[mv.classification]}`}>
                  <span className="font-mono font-bold">{mv.move_number}{mv.color === 'white' ? '.' : '…'}{mv.san}{MOVE_SYMBOL[mv.classification]}</span>
                  <span className="ml-2">{mv.description}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {activeTab === 'moves' && !feedback?.moveList && (
        <Card><p className="text-gray-500 text-sm text-center py-4">Move data not available — re-analyse this game.</p></Card>
      )}

      {/* Mistakes tab */}
      {activeTab === 'mistakes' && analysis && (
        <div className="space-y-3">
          {[...(analysis.blunders ?? []), ...(analysis.mistakes ?? [])].length === 0 ? (
            <Card>
              <p className="text-gray-500 text-sm text-center py-4">No major mistakes detected — great game!</p>
            </Card>
          ) : (
            [...(analysis.blunders ?? []), ...(analysis.mistakes ?? [])].map((m, i) => (
              <Card key={i} className={m.type === 'blunder' ? 'border-red-200' : 'border-orange-200'}>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={m.type === 'blunder' ? 'learning' : 'developing'}>
                    {m.type}
                  </Badge>
                  <span className="text-sm font-mono text-gray-600">
                    Move {m.move_number}: {m.move_san}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{m.description}</p>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Coach chat tab */}
      {activeTab === 'chat' && student && (
        <Card padding="none" className="h-96">
          <CoachChat
            student={student}
            gameId={gameId}
            skillTags={analysis?.skill_tags ?? []}
          />
        </Card>
      )}
    </div>
  )
}
