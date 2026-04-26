import { forkLesson }            from './forkLesson'
import { pinLesson }             from './pinLesson'
import { skewerLesson }          from './skewerLesson'
import { checkmateLesson }       from './checkmateLesson'
import { kingSafetyLesson }      from './kingSafetyLesson'
import { hangingPiecesLesson }   from './hangingPiecesLesson'
import { developmentLesson }     from './developmentLesson'
import { threatAwarenessLesson } from './threatAwarenessLesson'
import { pawnStructureLesson }   from './pawnStructureLesson'
import { endgameLesson }         from './endgameLesson'
import { tacticsComboLesson }    from './tacticsComboLesson'
import type { TrainerLesson }    from '@/types/trainer'

/**
 * Keyed by the `theme` field stored in the database Lesson rows.
 * When LessonsPage opens any lesson, it checks this map first.
 * If the theme has a rich hardcoded TrainerLesson, use it.
 * Otherwise fall back to lessonAdapter (text-only or board-demo conversion).
 */
export const TRAINER_LESSON_MAP: Record<string, TrainerLesson> = {
  forks:               forkLesson,
  pins:                pinLesson,
  skewers:             skewerLesson,
  checkmate_patterns:  checkmateLesson,
  king_safety:         kingSafetyLesson,
  hanging_pieces:      hangingPiecesLesson,
  development:         developmentLesson,
  threat_awareness:    threatAwarenessLesson,
  pawn_structure:      pawnStructureLesson,
  endgame_basics:      endgameLesson,
  tactics_combo:       tacticsComboLesson,
}
