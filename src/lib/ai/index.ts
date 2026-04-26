// Route to real or mock coach based on env flag
import type { CoachContext, CoachingFeedback, ChatMessage, CoachChatResponse } from './types'

const useMock = process.env.NEXT_PUBLIC_USE_MOCK_AI === 'true'

async function getCoach() {
  if (useMock) return import('./coach.mock')
  return import('./coach')
}

export async function generatePostGameFeedback(ctx: CoachContext): Promise<CoachingFeedback> {
  const coach = await getCoach()
  return coach.generatePostGameFeedback(ctx)
}

export async function chatWithCoach(
  history: ChatMessage[],
  ctx: Pick<CoachContext, 'studentName' | 'explanationMode' | 'ratingBand' | 'skillTags'>
): Promise<CoachChatResponse> {
  const coach = await getCoach()
  return coach.chatWithCoach(history, ctx)
}

export type { CoachContext, CoachingFeedback, ChatMessage, CoachChatResponse }
