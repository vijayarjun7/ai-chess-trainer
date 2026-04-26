// Real Claude API coach — used when NEXT_PUBLIC_USE_MOCK_AI=false
import Anthropic from '@anthropic-ai/sdk'
import type { CoachContext, CoachingFeedback, ChatMessage, CoachChatResponse } from './types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are an expert chess coach teaching students aged 6 and above.

RULES:
- Adapt your language to the explanation_mode provided in context.
- simple mode: very short sentences, no jargon, encouraging.
- intermediate mode: short explanations, light chess terms.
- advanced mode: normal coaching language.
- No engine numbers or long variations.
- Keep each output section under 3 sentences.
- Always be encouraging but clear and direct.
- Focus on the single most impactful improvement.

OUTPUT FORMAT for post-game feedback (return valid JSON):
{
  "quickSummary": "...",
  "mainProblem": "...",
  "doneWell": "...",
  "nextGameFocus": "...",
  "trainingPlan": ["...", "...", "..."]
}

For chat questions, respond naturally in the student's language level.`

function buildFeedbackPrompt(ctx: CoachContext): string {
  return `
Student: ${ctx.studentName}, age ${ctx.age ?? 'unknown'}, mode: ${ctx.explanationMode}
Rating band: ${ctx.ratingBand}
Game result: ${ctx.gameResult ?? 'unknown'}
Skill issues this game: ${ctx.skillTags.join(', ') || 'none detected'}
Key mistakes: ${ctx.recentMistakes.join('; ') || 'none detected'}

Generate post-game coaching feedback as JSON.
`.trim()
}

export async function generatePostGameFeedback(ctx: CoachContext): Promise<CoachingFeedback> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildFeedbackPrompt(ctx) }],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Coach returned invalid JSON')
  return JSON.parse(jsonMatch[0]) as CoachingFeedback
}

export async function chatWithCoach(
  history: ChatMessage[],
  ctx: Pick<CoachContext, 'studentName' | 'explanationMode' | 'ratingBand' | 'skillTags'>
): Promise<CoachChatResponse> {
  const contextNote = `
[Student: ${ctx.studentName}, mode: ${ctx.explanationMode}, rating: ${ctx.ratingBand}, focus areas: ${ctx.skillTags.join(', ') || 'general'}]
`.trim()

  const messages = [
    { role: 'user' as const, content: contextNote },
    ...history.map(m => ({ role: m.role === 'coach' ? 'assistant' as const : 'user' as const, content: m.content })),
  ]

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 300,
    system: SYSTEM_PROMPT,
    messages,
  })

  const reply = response.content[0].type === 'text' ? response.content[0].text : 'I could not answer that. Try again!'
  return { reply }
}
