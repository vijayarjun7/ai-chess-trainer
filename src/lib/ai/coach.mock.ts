// MOCK: used when NEXT_PUBLIC_USE_MOCK_AI=true
// Simulates Claude API responses for local development without an API key.

import type { CoachContext, CoachingFeedback, ChatMessage, CoachChatResponse } from './types'


const PROBLEMS_BY_TAG: Record<string, Record<string, string>> = {
  simple: {
    hanging_pieces: 'You left a piece with no friend to protect it. The other player took it for free!',
    forks:          'The other player used one move to attack two of your pieces at the same time.',
    king_safety:    'Your King stayed in the middle too long. Try to castle early to keep it safe.',
    development:    'Some pieces stayed at home too long. Try to bring them out early!',
    default:        'Your biggest mistake was leaving a piece where it could be taken for free.',
  },
  intermediate: {
    hanging_pieces: 'The main problem was hanging pieces — pieces left without defenders that the opponent captured for free.',
    forks:          'The opponent set up a fork — one move attacking two of your pieces. Look for this pattern!',
    king_safety:    'King safety was the main issue. Castle early and keep pawns in front of your King.',
    development:    'Piece development was slow. Get all your minor pieces out before attacking.',
    default:        'The main issue was a tactical oversight — a piece was left undefended.',
  },
  advanced: {
    hanging_pieces: 'The critical error was leaving a piece without sufficient defense, allowing a free capture.',
    forks:          'The opponent executed a fork — a single piece attacking two targets simultaneously. Piece coordination must improve.',
    king_safety:    'King safety was compromised. Ensure castling happens early when the center is open.',
    development:    'Development was slow, allowing the opponent to seize space and initiative.',
    default:        'The key mistake was a tactical oversight — a piece was left en prise.',
  },
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function buildSummary(ctx: CoachContext): string {
  const mode        = ctx.explanationMode
  const total       = ctx.recentMistakes.length
  // Heuristic: descriptions containing "blunder" are blunders, rest are mistakes
  const blunders    = ctx.recentMistakes.filter(m => m.toLowerCase().includes('blunder')).length
  const mistakes    = total - blunders
  const primaryTag  = ctx.skillTags[0] ?? null
  const tagLabel    = primaryTag ?? 'tactical awareness'
  const resultPart  = ctx.gameResult === 'win'  ? 'You won'
                    : ctx.gameResult === 'loss' ? 'You lost'
                    : ctx.gameResult === 'draw' ? 'The game was drawn'
                    : 'The game ended'

  if (mode === 'simple') {
    if (total === 0) return `${resultPart} — and you didn't make any big mistakes. Well done!`
    if (blunders > 0) return `${resultPart}. You left ${blunders === 1 ? 'a piece' : `${blunders} pieces`} where the other player could take it for free. Let's fix that!`
    return `${resultPart}. You made ${total} mistake${total > 1 ? 's' : ''} this game. Keep going — you'll get better!`
  }

  if (mode === 'advanced') {
    if (total === 0) return `${resultPart} with no major errors detected. Review for subtle inaccuracies.`
    if (blunders > 0 && primaryTag) return `${resultPart}. ${blunders} blunder${blunders > 1 ? 's' : ''} recorded — the primary issue was ${tagLabel}. Tactical precision needs attention.`
    if (blunders > 0) return `${resultPart}. ${blunders} blunder${blunders > 1 ? 's' : ''} recorded. Piece safety and tactical vigilance must improve.`
    return `${resultPart} with ${mistakes} mistake${mistakes > 1 ? 's' : ''}. Positional understanding was the limiting factor — focus on ${tagLabel}.`
  }

  // intermediate
  if (total === 0) return `${resultPart} with no major mistakes. Solid game overall.`
  if (blunders > 0 && primaryTag) return `${resultPart}. You made ${blunders} blunder${blunders > 1 ? 's' : ''} — mainly around ${tagLabel}. That's today's key area to improve.`
  if (blunders > 0) return `${resultPart}. You made ${blunders} blunder${blunders > 1 ? 's' : ''} — pieces were left undefended. Watch for threats before every move.`
  return `${resultPart} with ${total} mistake${total > 1 ? 's' : ''} — not blunders, but worth reviewing. Focus on ${tagLabel} this week.`
}

export async function generatePostGameFeedback(ctx: CoachContext): Promise<CoachingFeedback> {
  const mode = ctx.explanationMode
  const primaryTag = ctx.skillTags[0] ?? 'default'

  const problemMap = PROBLEMS_BY_TAG[mode] ?? PROBLEMS_BY_TAG.intermediate
  const mainProblem = problemMap[primaryTag] ?? problemMap.default

  return {
    quickSummary:  buildSummary(ctx),
    mainProblem,
    doneWell:      mode === 'simple'
      ? 'You remembered to move pieces toward the middle! Great start.'
      : mode === 'intermediate'
      ? 'Your opening moves were solid — good center control early on.'
      : 'Your opening principles were sound. Center control and piece activity were adequate.',
    nextGameFocus: mode === 'simple'
      ? 'Before you move, ask: "Is my piece safe?" every time!'
      : mode === 'intermediate'
      ? `Before each move, check if any of your pieces can be taken for free.`
      : 'Integrate a pre-move checklist: threats first, then your plan.',
    trainingPlan: [
      mode === 'simple'
        ? 'Do 3 "hanging piece" puzzles — find the piece with no friends!'
        : 'Complete 5 hanging-piece puzzles to train piece safety awareness.',
      mode === 'simple'
        ? 'Play one slow game. Look at every piece before you move.'
        : 'Play one slow-time-control game focused on checking threats each move.',
      mode === 'simple'
        ? 'Read the lesson: "Do Not Leave Pieces Alone!"'
        : `Review the lesson on ${ctx.skillTags[0] ?? 'tactical awareness'}.`,
    ],
    assumptionsNote: '[MOCK] This feedback was generated by the mock coach — no API key required.',
  }
}

export async function chatWithCoach(
  history: ChatMessage[],
  ctx: Pick<CoachContext, 'studentName' | 'explanationMode' | 'ratingBand' | 'skillTags'>
): Promise<CoachChatResponse> {
  const lastMessage = history[history.length - 1]?.content?.toLowerCase() ?? ''
  const mode = ctx.explanationMode

  if (lastMessage.includes('fork')) {
    return {
      reply: mode === 'simple'
        ? 'A fork is when one piece attacks two pieces at the same time! Like hitting two targets with one stone.'
        : 'A fork happens when one piece attacks two of your opponent\'s pieces at once, winning material.',
    }
  }

  if (lastMessage.includes('castle') || lastMessage.includes('castling')) {
    return {
      reply: mode === 'simple'
        ? 'Castling moves your King to a safe corner behind pawns. Do it early!'
        : 'Castling is a special move to keep your King safe. Castle early when the center is open.',
    }
  }

  const generic = [
    mode === 'simple'
      ? "Great question! Keep practicing and you'll get better every day."
      : "Good question. Keep working on your weaknesses and you'll see steady improvement.",
    mode === 'simple'
      ? 'Chess is like a puzzle. Think before every move!'
      : 'Every game is a learning opportunity. Focus on one improvement at a time.',
  ]

  return { reply: pickRandom(generic) }
}
