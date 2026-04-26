// Demo mode — mock data returned when NEXT_PUBLIC_DEMO_MODE=true
// Lets the full UI be explored locally without Supabase credentials.

import type { Student, Skill, Game } from '@/types/database'
import type { AdaptiveRecommendation } from '@/types/skills'
import type { DailyPlanWithProgress } from '@/types/training'

export const DEMO_STUDENT: Student = {
  id:               'demo-student',
  user_id:          'demo-user',
  name:             'Alex',
  age:              10,
  rating_band:      '400-700',
  estimated_rating: 550,
  skill_level:      'beginner',
  explanation_mode: 'intermediate',
  parent_mode:      false,
  onboarding_done:  true,
  created_at:       new Date().toISOString(),
  updated_at:       new Date().toISOString(),
}

export const DEMO_SKILLS: Skill[] = [
  { id: '1', student_id: 'demo-student', skill_name: 'hanging_pieces',     category: 'tactics',   score: 38,  mastery_level: 'learning',   games_sampled: 5, puzzles_solved: 3, last_updated: new Date().toISOString() },
  { id: '2', student_id: 'demo-student', skill_name: 'forks',              category: 'tactics',   score: 44,  mastery_level: 'learning',   games_sampled: 5, puzzles_solved: 2, last_updated: new Date().toISOString() },
  { id: '3', student_id: 'demo-student', skill_name: 'checkmate_patterns', category: 'tactics',   score: 52,  mastery_level: 'developing', games_sampled: 5, puzzles_solved: 5, last_updated: new Date().toISOString() },
  { id: '4', student_id: 'demo-student', skill_name: 'king_safety',        category: 'strategy',  score: 61,  mastery_level: 'developing', games_sampled: 5, puzzles_solved: 4, last_updated: new Date().toISOString() },
  { id: '5', student_id: 'demo-student', skill_name: 'development',        category: 'opening',   score: 70,  mastery_level: 'proficient', games_sampled: 5, puzzles_solved: 6, last_updated: new Date().toISOString() },
  { id: '6', student_id: 'demo-student', skill_name: 'threat_awareness',   category: 'awareness', score: 47,  mastery_level: 'learning',   games_sampled: 5, puzzles_solved: 2, last_updated: new Date().toISOString() },
  { id: '7', student_id: 'demo-student', skill_name: 'pins',               category: 'tactics',   score: 55,  mastery_level: 'developing', games_sampled: 3, puzzles_solved: 3, last_updated: new Date().toISOString() },
  { id: '8', student_id: 'demo-student', skill_name: 'endgame_basics',     category: 'endgame',   score: 42,  mastery_level: 'learning',   games_sampled: 2, puzzles_solved: 1, last_updated: new Date().toISOString() },
]

export const DEMO_RECOMMENDATIONS: AdaptiveRecommendation[] = [
  { priority: 'high',   type: 'puzzle',     skill_name: 'hanging_pieces',   label: 'Hanging Pieces',   reason: 'Your Hanging Pieces score is very low — targeted puzzles will help most.' },
  { priority: 'medium', type: 'lesson',     skill_name: 'hanging_pieces',   label: 'Hanging Pieces',   reason: 'Review the lesson on Hanging Pieces to strengthen your understanding.' },
  { priority: 'medium', type: 'puzzle',     skill_name: 'forks',            label: 'Forks',            reason: 'You can improve your Forks skill with more practice.' },
  { priority: 'low',    type: 'game_focus', skill_name: 'hanging_pieces',   label: 'Hanging Pieces',   reason: 'During your next game, pay extra attention to Hanging Pieces.' },
]

export const DEMO_GAMES: Game[] = [
  { id: 'demo-game-1', student_id: 'demo-student', pgn: null, fen_final: null, result: 'black_wins', player_color: 'white', opponent_style: 'balanced', ai_level: 3, move_count: 28, duration_seconds: 320, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'demo-game-2', student_id: 'demo-student', pgn: null, fen_final: null, result: 'white_wins', player_color: 'white', opponent_style: 'tactical', ai_level: 3, move_count: 42, duration_seconds: 480, created_at: new Date(Date.now() - 172800000).toISOString() },
  { id: 'demo-game-3', student_id: 'demo-student', pgn: null, fen_final: null, result: 'draw',       player_color: 'black', opponent_style: 'defensive', ai_level: 2, move_count: 55, duration_seconds: 600, created_at: new Date(Date.now() - 259200000).toISOString() },
]

export const isDemoMode = () =>
  process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

// ── Daily plan demo data ──────────────────────────────────────────────────

const TODAY = new Date().toISOString().split('T')[0]

export const DEMO_DAILY_PLAN: DailyPlanWithProgress = {
  plan: {
    id:                'demo-plan-1',
    studentId:         'demo-student',
    date:              TODAY,
    diagnosticGameId:  'demo-game-1',
    primaryWeakness:   'hanging_pieces',
    secondaryWeakness: 'forks',
    strongestSkill:    'development',
    targets: [
      {
        id:                  'demo-target-1',
        skill:               'hanging_pieces',
        skillLabel:          'Hanging Pieces',
        priority:            'primary',
        skillScoreAtStart:   38,
        lessonTheme:         'hanging_pieces',
        puzzleTarget:        5,
        puzzlePassThreshold: 3,
        focusedGameRequired: true,
      },
      {
        id:                  'demo-target-2',
        skill:               'forks',
        skillLabel:          'Forks',
        priority:            'secondary',
        skillScoreAtStart:   44,
        lessonTheme:         'forks',
        puzzleTarget:        5,
        puzzlePassThreshold: 3,
        focusedGameRequired: false,
      },
      {
        id:                  'demo-target-3',
        skill:               'checkmate_patterns',
        skillLabel:          'Checkmate Patterns',
        priority:            'bonus',
        skillScoreAtStart:   52,
        lessonTheme:         'checkmate_patterns',
        puzzleTarget:        5,
        puzzlePassThreshold: 3,
        focusedGameRequired: false,
      },
    ],
    status:      'in_progress',
    completedAt: null,
    createdAt:   new Date().toISOString(),
    updatedAt:   new Date().toISOString(),
  },
  progress: [
    {
      targetId:            'demo-target-1',
      skill:               'hanging_pieces',
      skillLabel:          'Hanging Pieces',
      priority:            'primary',
      lessonCompleted:     false,
      puzzlesAttempted:    2,
      puzzlesCorrect:      1,
      puzzleAccuracy:      50,
      gamesPlayedToday:    0,
      isComplete:          false,
      activitiesRemaining: [
        'Complete the Hanging Pieces lesson',
        'Solve 2 more Hanging Pieces puzzles',
        'Play a focused game',
      ],
    },
    {
      targetId:            'demo-target-2',
      skill:               'forks',
      skillLabel:          'Forks',
      priority:            'secondary',
      lessonCompleted:     false,
      puzzlesAttempted:    0,
      puzzlesCorrect:      0,
      puzzleAccuracy:      0,
      gamesPlayedToday:    0,
      isComplete:          false,
      activitiesRemaining: [
        'Complete the Forks lesson',
        'Solve 3 Forks puzzles',
      ],
    },
    {
      targetId:            'demo-target-3',
      skill:               'checkmate_patterns',
      skillLabel:          'Checkmate Patterns',
      priority:            'bonus',
      lessonCompleted:     false,
      puzzlesAttempted:    0,
      puzzlesCorrect:      0,
      puzzleAccuracy:      0,
      gamesPlayedToday:    0,
      isComplete:          false,
      activitiesRemaining: [
        'Complete the Checkmate Patterns lesson',
        'Solve 3 Checkmate Patterns puzzles',
      ],
    },
  ],
  overallComplete:    false,
  completionPercent:  20,
  nextRecommendation: null,
}
