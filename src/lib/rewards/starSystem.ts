import type { ExplanationMode, SkillLevel, GameResult } from '@/types/database'
import type { SkillName } from '@/types/skills'

// ── Types ───────────────────────────────��─────────────────���───────────────────

export type StarCategory =
  | 'completion'
  | 'focus'
  | 'tactic'
  | 'strategy'
  | 'puzzle'
  | 'improvement'
  | 'comeback'
  | 'consistency'

export interface StarReward {
  category:  StarCategory
  stars:     number          // 1–3
  reason:    string          // human-readable, age-adapted
  sourceType: 'game' | 'lesson' | 'puzzle' | 'daily_plan'
}

// ── Evaluation contexts ──────────────────────────────────���────────────────────

export interface GameRewardContext {
  gameResult:          GameResult | null
  playerColor:         'white' | 'black'
  blundersThisGame:    number
  mistakesThisGame:    number
  skillTags:           string[]
  moveCount:           number
  todaysPrimarySkill:  SkillName | null
  age:                 number | null
  skillLevel:          SkillLevel
  explanationMode:     ExplanationMode
}

export interface PuzzleRewardContext {
  correct:            number
  total:              number
  focusSkill:         string | null
  todaysPrimarySkill: SkillName | null
  age:                number | null
  skillLevel:         SkillLevel
  explanationMode:    ExplanationMode
}

export interface LessonRewardContext {
  lessonTheme:        string
  todaysPrimarySkill: SkillName | null
  age:                number | null
  skillLevel:         SkillLevel
  explanationMode:    ExplanationMode
}

// ── Tone helpers ──────────────────────────────────────────────────────��───────

type Tone = 'young' | 'mid' | 'teen' | 'adult'

function tone(age: number | null, mode: ExplanationMode): Tone {
  if (mode === 'simple' || (age !== null && age <= 8))  return 'young'
  if (age !== null && age <= 12)                         return 'mid'
  if (age !== null && age <= 16)                         return 'teen'
  return 'adult'
}

function pick<T>(t: Tone, young: T, mid: T, teen: T, adult: T): T {
  if (t === 'young') return young
  if (t === 'mid')   return mid
  if (t === 'teen')  return teen
  return adult
}

// ── Puzzle accuracy thresholds ────────────────────────────────────────────────

function puzzleThresholds(level: SkillLevel): [number, number, number] {
  // [1-star %, 2-star %, 3-star %]
  if (level === 'beginner')     return [55, 70, 85]
  if (level === 'intermediate') return [65, 80, 90]
  return /* advanced */         [70, 85, 95]
}

// ── Game rewards ─────────────────────────────────���──────────────────────────���─

export function evaluateGameRewards(ctx: GameRewardContext): StarReward[] {
  const rewards: StarReward[] = []
  const t = tone(ctx.age, ctx.explanationMode)

  const won = (ctx.gameResult === 'white_wins' && ctx.playerColor === 'white') ||
              (ctx.gameResult === 'black_wins' && ctx.playerColor === 'black')
  const drew    = ctx.gameResult === 'draw'
  const finished = ctx.gameResult !== 'abandoned' && ctx.gameResult !== null

  // ── 1. Completion ────────��─────────────────────────────────────────────────
  if (finished) {
    const stars = won ? 2 : 1
    const reason = won
      ? pick(t,
          'You won the game! Amazing! 🎉',
          'You won! Excellent play.',
          'Win — well earned.',
          'Game won.')
      : drew
      ? pick(t,
          'You drew! That\'s really good! 🤝',
          'You drew — solid result.',
          'Draw — a fair result.',
          'Game drawn.')
      : pick(t,
          'You finished the game — that\'s brave! 🌟',
          'You played to the end — good sportsmanship.',
          'Game completed. Every game is a lesson.',
          'Game completed.')
    rewards.push({ category: 'completion', stars, reason, sourceType: 'game' })
  }

  // ── 2. Tactic star — blunder count ─────────────────────────────��──────────
  const b = ctx.blundersThisGame
  if (b === 0) {
    rewards.push({
      category: 'tactic', stars: 3, sourceType: 'game',
      reason: pick(t,
        'No big mistakes! You kept all your pieces safe! ⭐',
        'Zero blunders — clean tactical game.',
        'No blunders — sharp play throughout.',
        'No blunders recorded.'),
    })
  } else if (b <= 1) {
    rewards.push({
      category: 'tactic', stars: 2, sourceType: 'game',
      reason: pick(t,
        'Only one mistake — you were so careful! 🧩',
        'Just one blunder — that\'s a strong game.',
        'One blunder — good tactical discipline.',
        'One blunder — disciplined.'),
    })
  } else if (b <= 2 && ctx.skillLevel !== 'beginner') {
    rewards.push({
      category: 'tactic', stars: 1, sourceType: 'game',
      reason: pick(t,
        'You were careful in most of the game! 💪',
        'Mostly solid — a couple of slip-ups to review.',
        'Two blunders to work on — good overall.',
        'Two blunders noted.'),
    })
  }

  // ── 3. Focus star — today's training skill ───────────────────────────���─────
  if (ctx.todaysPrimarySkill) {
    const skillLabel = ctx.skillTags.includes(ctx.todaysPrimarySkill)
      ? ctx.todaysPrimarySkill.replace(/_/g, ' ')
      : null

    if (skillLabel) {
      // Skill appeared in game → student was engaged with the target area
      rewards.push({
        category: 'focus', stars: 2, sourceType: 'game',
        reason: pick(t,
          `You practiced ${skillLabel} today — just like the plan! 🎯`,
          `Today\'s focus (${skillLabel}) came up in the game.`,
          `Focus area practiced: ${skillLabel}.`,
          `Training target (${skillLabel}) engaged this game.`),
      })
    }
  }

  // ── 4. Strategy star — no opening/strategic errors ────────────────────────
  const strategicErrors = ctx.skillTags.filter(s =>
    ['king_safety', 'development', 'pawn_structure'].includes(s)
  )
  if (strategicErrors.length === 0 && ctx.moveCount >= 15) {
    rewards.push({
      category: 'strategy', stars: 1, sourceType: 'game',
      reason: pick(t,
        'You played the opening really well! 📖',
        'No strategic errors — solid opening and development.',
        'Clean strategic play — no structural errors.',
        'No strategic errors detected.'),
    })
  }

  // ── 5. Comeback star — many mistakes but completed ────────────────────────
  if (b >= 3 && finished) {
    rewards.push({
      category: 'comeback', stars: 1, sourceType: 'game',
      reason: pick(t,
        'You kept going even when it was hard — that\'s a champion! 💪',
        'You kept playing through tough moments — that takes resilience.',
        'You stayed in the game despite the setbacks.',
        'Completed a difficult game — resilience noted.'),
    })
  }

  // ── 6. Improvement star — clean positional game ───────────────────────────
  // Award when the student shows measurable quality: all mistakes + blunders < threshold
  const totalErrors = b + ctx.mistakesThisGame
  const threshold = ctx.skillLevel === 'beginner' ? 5
                  : ctx.skillLevel === 'intermediate' ? 3
                  : 2
  if (totalErrors <= threshold && ctx.moveCount >= 15) {
    rewards.push({
      category: 'improvement', stars: 2, sourceType: 'game',
      reason: pick(t,
        'You made very few mistakes — you are improving! 🚀',
        `Only ${totalErrors} error${totalErrors !== 1 ? 's' : ''} — that\'s real progress.`,
        `${totalErrors} error${totalErrors !== 1 ? 's' : ''} — improving consistency.`,
        `${totalErrors} total errors — within target.`),
    })
  }

  return rewards
}

// ── Puzzle set rewards ──────────────────────────────────────────────────────��─

export function evaluatePuzzleSetRewards(ctx: PuzzleRewardContext): StarReward[] {
  const rewards: StarReward[] = []
  const t = tone(ctx.age, ctx.explanationMode)

  if (ctx.total < 1) return rewards

  const accuracy   = ctx.total > 0 ? Math.round((ctx.correct / ctx.total) * 100) : 0
  const [t1, t2, t3] = puzzleThresholds(ctx.skillLevel)

  // ── 1. Completion ────────────────────���─────────────────────────────��───────
  if (ctx.total >= 3) {
    rewards.push({
      category: 'completion', stars: 1, sourceType: 'puzzle',
      reason: pick(t,
        `You tried ${ctx.total} puzzles — keep it up! 🧩`,
        `${ctx.total} puzzles attempted — good session.`,
        `${ctx.total} puzzles completed.`,
        `${ctx.total} puzzles attempted.`),
    })
  }

  // ── 2. Puzzle accuracy star ────────────────────────���───────────────────────
  if (accuracy >= t1) {
    const stars = accuracy >= t3 ? 3 : accuracy >= t2 ? 2 : 1
    rewards.push({
      category: 'puzzle', stars, sourceType: 'puzzle',
      reason: pick(t,
        `${accuracy}% correct — you are great at puzzles! ⭐`,
        `${accuracy}% accuracy — ${stars === 3 ? 'excellent' : stars === 2 ? 'solid' : 'good'} puzzle solving.`,
        `${accuracy}% accuracy.`,
        `${accuracy}% accuracy — ${stars === 3 ? 'excellent' : stars === 2 ? 'good' : 'meets threshold'}.`),
    })
  }

  // ── 3. Focus star — puzzle skill matches daily plan ───────────────────��────
  if (ctx.focusSkill && ctx.todaysPrimarySkill &&
      ctx.focusSkill === ctx.todaysPrimarySkill && ctx.correct > 0) {
    const skill = ctx.focusSkill.replace(/_/g, ' ')
    rewards.push({
      category: 'focus', stars: 2, sourceType: 'puzzle',
      reason: pick(t,
        `You practiced ${skill} — your training target today! 🎯`,
        `Solved puzzles on today\'s focus: ${skill}.`,
        `Today\'s focus skill (${skill}) practised.`,
        `Focus skill (${skill}) practised this session.`),
    })
  }

  // ── 4. Consistency star — high correct count ──────────────────────────────
  if (ctx.correct >= 4 && accuracy >= t2) {
    rewards.push({
      category: 'consistency', stars: 1, sourceType: 'puzzle',
      reason: pick(t,
        `${ctx.correct} correct in a row area — amazing focus! 🔥`,
        `${ctx.correct} correct — consistent and focused.`,
        `${ctx.correct} correct — strong consistency.`,
        `${ctx.correct} correct answers — consistent performance.`),
    })
  }

  return rewards
}

// ── Lesson rewards ────────────────────────────────────────────────────────────

export function evaluateLessonRewards(ctx: LessonRewardContext): StarReward[] {
  const t = tone(ctx.age, ctx.explanationMode)
  const rewards: StarReward[] = []
  const theme = ctx.lessonTheme.replace(/_/g, ' ')

  rewards.push({
    category: 'completion', stars: 2, sourceType: 'lesson',
    reason: pick(t,
      `You finished the ${theme} lesson — you\'re learning fast! 📖`,
      `${theme} lesson complete — well done.`,
      `${theme} lesson completed.`,
      `Lesson completed: ${theme}.`),
  })

  if (ctx.todaysPrimarySkill && ctx.lessonTheme === ctx.todaysPrimarySkill) {
    rewards.push({
      category: 'focus', stars: 2, sourceType: 'lesson',
      reason: pick(t,
        'That was your training goal for today! Right on target! 🎯',
        'That lesson matches your daily training target.',
        'Daily focus lesson completed.',
        'Training target lesson completed.'),
    })
  }

  return rewards
}

// ── Daily plan completion rewards ─────────────────────────────────────────────

export function evaluateDailyPlanRewards(
  age: number | null,
  mode: ExplanationMode,
  targetsCompleted: number,
  totalTargets: number,
): StarReward[] {
  const t = tone(age, mode)
  const rewards: StarReward[] = []

  if (targetsCompleted === 0) return rewards

  const allDone = targetsCompleted >= totalTargets

  if (allDone) {
    rewards.push({
      category: 'consistency', stars: 3, sourceType: 'daily_plan',
      reason: pick(t,
        'You finished ALL your training today! You are incredible! 🏆',
        'All daily targets completed — outstanding consistency.',
        'Daily plan complete — impressive discipline.',
        'Daily training plan completed.'),
    })
  } else if (targetsCompleted >= 1) {
    rewards.push({
      category: 'focus', stars: 2, sourceType: 'daily_plan',
      reason: pick(t,
        `${targetsCompleted} training goal${targetsCompleted > 1 ? 's' : ''} done today! Keep going! ⭐`,
        `${targetsCompleted}/${totalTargets} targets hit today.`,
        `${targetsCompleted}/${totalTargets} training targets completed.`,
        `${targetsCompleted}/${totalTargets} targets completed.`),
    })
  }

  return rewards
}

// ── Aggregate helpers ────────────────────────────────���────────────────────────

export function totalStars(rewards: StarReward[]): number {
  return rewards.reduce((sum, r) => sum + r.stars, 0)
}

export function encouragingMessage(
  total:      number,
  age:        number | null,
  mode:       ExplanationMode,
  sourceType: 'game' | 'puzzle' | 'lesson' | 'daily_plan',
): string {
  const t = tone(age, mode)

  if (total === 0) {
    return pick(t,
      'Keep trying — you will get stars soon! 💙',
      'No stars this time — but every session makes you better.',
      'No stars this session — keep at it.',
      'No stars this session. Review the feedback and improve.')
  }

  if (total >= 8) {
    return pick(t,
      'WOW! Amazing! You are a chess star! 🌟🌟🌟',
      'Exceptional session — you earned a full set of stars!',
      'Outstanding performance this session.',
      'Excellent session — all targets met.')
  }

  if (total >= 5) {
    return pick(t,
      'Super job! You earned so many stars! ⭐⭐⭐',
      `Great ${sourceType} — ${total} stars earned!`,
      `Strong ${sourceType} — ${total} stars.`,
      `Good ${sourceType}. ${total} stars.`)
  }

  if (total >= 3) {
    return pick(t,
      'Good work! You are getting better every day! ⭐',
      `Solid ${sourceType} — ${total} stars.`,
      `${total} stars — keep the momentum.`,
      `${total} stars earned.`)
  }

  return pick(t,
    'You got a star! That\'s a great start! 🎊',
    `${total} star${total > 1 ? 's' : ''} — a start. Keep working.`,
    `${total} star${total > 1 ? 's' : ''} — room to grow.`,
    `${total} star${total > 1 ? 's' : ''}.`)
}

// ── Category metadata ────────────────────────────��────────────────────────────

export const CATEGORY_META: Record<StarCategory, { icon: string; label: string; color: string }> = {
  completion:  { icon: '✅', label: 'Completion',  color: 'bg-green-50 border-green-200 text-green-800' },
  focus:       { icon: '🎯', label: 'Focus',        color: 'bg-brand-50 border-brand-200 text-brand-800' },
  tactic:      { icon: '⚔️', label: 'Tactics',      color: 'bg-red-50 border-red-200 text-red-800' },
  strategy:    { icon: '♟️', label: 'Strategy',     color: 'bg-purple-50 border-purple-200 text-purple-800' },
  puzzle:      { icon: '🧩', label: 'Puzzle',        color: 'bg-amber-50 border-amber-200 text-amber-800' },
  improvement: { icon: '📈', label: 'Improvement',  color: 'bg-teal-50 border-teal-200 text-teal-800' },
  comeback:    { icon: '💪', label: 'Comeback',      color: 'bg-orange-50 border-orange-200 text-orange-800' },
  consistency: { icon: '🔥', label: 'Consistency',  color: 'bg-rose-50 border-rose-200 text-rose-800' },
}
