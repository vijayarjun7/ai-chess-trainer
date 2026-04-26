export type SkillName =
  | 'hanging_pieces'
  | 'forks'
  | 'pins'
  | 'skewers'
  | 'checkmate_patterns'
  | 'king_safety'
  | 'development'
  | 'pawn_structure'
  | 'endgame_basics'
  | 'threat_awareness'
  | 'tactics_combo'

export type SkillCategory = 'tactics' | 'strategy' | 'endgame' | 'opening' | 'awareness'

export const SKILL_CATALOG: Record<SkillName, { category: SkillCategory; label: string; description: string }> = {
  hanging_pieces:    { category: 'tactics',   label: 'Hanging Pieces',     description: 'Avoiding leaving pieces undefended' },
  forks:             { category: 'tactics',   label: 'Forks',              description: 'Attacking two pieces with one move' },
  pins:              { category: 'tactics',   label: 'Pins',               description: 'Pinning pieces to more valuable ones' },
  skewers:           { category: 'tactics',   label: 'Skewers',            description: 'Skewering pieces along diagonals/files' },
  checkmate_patterns:{ category: 'tactics',   label: 'Checkmate Patterns', description: 'Recognising and executing mates' },
  king_safety:       { category: 'strategy',  label: 'King Safety',        description: 'Keeping the King protected' },
  development:       { category: 'opening',   label: 'Development',        description: 'Bringing pieces into the game early' },
  pawn_structure:    { category: 'strategy',  label: 'Pawn Structure',     description: 'Understanding pawn formations' },
  endgame_basics:    { category: 'endgame',   label: 'Endgame Basics',     description: 'King and pawn endgame fundamentals' },
  threat_awareness:  { category: 'awareness', label: 'Threat Awareness',   description: "Spotting the opponent's threats" },
  tactics_combo:     { category: 'tactics',   label: 'Combination Play',   description: 'Executing multi-move tactical sequences' },
}

export const SCORE_TO_MASTERY = (score: number): 'learning' | 'developing' | 'proficient' | 'mastered' => {
  if (score >= 85) return 'mastered'
  if (score >= 65) return 'proficient'
  if (score >= 40) return 'developing'
  return 'learning'
}

export const MASTERY_COLOR: Record<string, string> = {
  mastered:   'text-green-600 bg-green-50',
  proficient: 'text-lime-600 bg-lime-50',
  developing: 'text-yellow-600 bg-yellow-50',
  learning:   'text-orange-600 bg-orange-50',
}

export interface SkillSummary {
  skill_name: SkillName
  label: string
  category: SkillCategory
  score: number
  mastery_level: string
  trend: 'up' | 'down' | 'stable'
}

export interface AdaptiveRecommendation {
  priority: 'high' | 'medium' | 'low'
  type: 'puzzle' | 'lesson' | 'game_focus'
  skill_name: SkillName
  label: string
  reason: string
}
