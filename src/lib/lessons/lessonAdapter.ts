import { Chess } from 'chess.js'
import type { Lesson } from '@/types/database'
import type { TrainerLesson, TrainerLessonStep, TrainerArrow } from '@/types/trainer'

const DEFAULT_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

/**
 * Converts any database Lesson into the TrainerLesson shape so it can be
 * opened in BoardTrainer. Puzzles are left empty — BoardTrainer fetches them
 * from the API using the lesson theme when the practice phase starts.
 */
export function lessonToTrainerLesson(lesson: Lesson): TrainerLesson {
  const content  = lesson.content
  const startFen = content.fen ?? DEFAULT_FEN
  const demoSteps = content.steps ?? []

  let steps: TrainerLessonStep[]

  if (demoSteps.length === 0) {
    // Text-only lesson: single step with the lesson body as the explanation
    const speech = content.body + (content.tip ? ` Tip: ${content.tip}` : '')
    steps = [
      {
        id: `${lesson.id}-intro`,
        title: lesson.title,
        fen: startFen,
        explanation: content.body,
        coachSpeech: speech,
        highlights: [],
        arrows: [],
      },
    ]
  } else {
    // Board-demo lesson: one TrainerLessonStep per DemoStep.
    // Each step shows the position BEFORE its own move so arrows/highlights
    // point to where the piece should go, matching what BoardDemo does.
    const chess = new Chess(startFen)
    const fenBeforeStep: string[] = []

    for (const s of demoSteps) {
      fenBeforeStep.push(chess.fen())
      if (s.move) {
        try {
          chess.move({
            from: s.move.slice(0, 2),
            to:   s.move.slice(2, 4),
            promotion: (s.move[4] ?? 'q') as 'q',
          })
        } catch {
          // invalid move in data — skip silently
        }
      }
    }

    steps = demoSteps.map((s, i) => {
      const arrows: TrainerArrow[] = (s.arrows ?? []).map(([from, to, color]) => ({
        from,
        to,
        color: color ?? '#16a34a',
      }))

      const title = s.san
        ? `Move ${i + 1}: ${s.san}`
        : `Step ${i + 1}`

      return {
        id: `${lesson.id}-step-${i}`,
        title,
        fen: fenBeforeStep[i],
        explanation: s.explanation,
        coachSpeech: s.explanation,
        highlights: s.highlights ?? [],
        arrows,
        moveToPlay: s.move,
      }
    })
  }

  return {
    id: lesson.id,
    title: lesson.title,
    theme: lesson.theme,
    description: content.body,
    steps,
    puzzles: [], // fetched from API by BoardTrainer via `puzzleTheme` prop
  }
}
