import type { TrainerLesson } from '@/types/trainer'

export const checkmateLesson: TrainerLesson = {
  id: 'lesson-checkmate-patterns',
  title: 'Checkmate Patterns',
  theme: 'checkmate_patterns',
  description: 'Learn the most powerful checkmate patterns that end games instantly!',

  steps: [
    {
      id: 'cm-step-1',
      title: 'Back-Rank Checkmate',
      fen: '6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1',
      explanation:
        'The back-rank checkmate happens when the enemy king is trapped on its back rank by its own pawns. A rook or queen delivers checkmate along that rank.',
      coachSpeech:
        'The back-rank mate is one of the most common ways games end! The king is hiding behind its own pawns on the last row. A rook or queen swoops in and — checkmate! The pawns that were supposed to protect the king become its prison.',
      highlights: ['g8', 'f7', 'g7', 'h7'],
      arrows: [
        { from: 'a1', to: 'a8', color: '#dc2626' },
      ],
    },
    {
      id: 'cm-step-2',
      title: "Scholar's Mate",
      fen: 'rnbqkbnr/pppp1ppp/8/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq - 0 3',
      explanation:
        "Scholar's Mate is a quick 4-move checkmate targeting f7, the weakest square near the king at the start. The queen and bishop combine to deliver checkmate.",
      coachSpeech:
        "Scholar's Mate is sneaky! It tries to checkmate in just 4 moves by targeting f7, the square next to the king that is only guarded by the king itself at the start. Watch out for this one!",
      highlights: ['f7'],
      arrows: [
        { from: 'c4', to: 'f7', color: '#dc2626' },
        { from: 'd1', to: 'h5', color: '#dc2626' },
      ],
    },
    {
      id: 'cm-step-3',
      title: 'Smothered Mate',
      fen: '6rk/6pp/8/8/8/8/8/5NK1 w - - 0 1',
      explanation:
        'A smothered mate happens when a knight gives checkmate to a king that is completely surrounded — smothered — by its own pieces. Only a knight can do this because it jumps over pieces!',
      coachSpeech:
        'This is one of the most spectacular mates in chess! The king is totally surrounded by its own pieces — nowhere to go. Then a knight jumps in and says checkmate! The king is smothered by its own army.',
      highlights: ['h8', 'g8', 'h7', 'g7'],
      arrows: [
        { from: 'f1', to: 'h2', color: '#dc2626' },
        { from: 'h2', to: 'f3', color: '#dc2626' },
      ],
    },
    {
      id: 'cm-step-4',
      title: 'The Hook Mate',
      fen: '5k2/5P1R/5K2/8/8/8/8/8 w - - 0 1',
      explanation:
        'The hook mate uses a rook and pawn together. The pawn blocks the king\'s escape, and the rook delivers checkmate from the side. A classic endgame weapon!',
      coachSpeech:
        'The hook mate is elegant! The pawn acts as a wall, blocking the king from running away. Then the rook swings over and delivers checkmate. The pawn and rook work together like a tag team.',
      highlights: ['f8', 'f7'],
      arrows: [
        { from: 'h7', to: 'f7', color: '#dc2626' },
      ],
    },
    {
      id: 'cm-step-5',
      title: 'Find the Back-Rank Mate!',
      fen: '6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1',
      explanation:
        'The Black king is trapped on g8 behind its own pawns on f7, g7, and h7. White has a rook on a1. Find the checkmate!',
      coachSpeech:
        'Classic back-rank trap! The Black king cannot go anywhere — its own pawns block the escape. Where should the White rook move to deliver checkmate along the back rank?',
      highlights: ['g8', 'f7', 'g7', 'h7', 'a1'],
      arrows: [],
      question: 'Where does the White rook go to deliver back-rank checkmate?',
      expectedAnswer: 'a1a8',
    },
  ],

  puzzles: [
    {
      id: 'cm-puzzle-1',
      fen: '6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1',
      solutionMoves: ['a1a8'],
      playerColor: 'white',
      hint: 'The king is stuck on the back rank — move the rook there.',
      explanation: 'Ra8# is checkmate! The king cannot escape because its own pawns on f7, g7, h7 block all retreats.',
    },
    {
      id: 'cm-puzzle-2',
      fen: '5rk1/5ppp/8/8/8/8/5PPP/5RK1 w - - 0 1',
      solutionMoves: ['f1f8'],
      playerColor: 'white',
      hint: 'Trade rooks and the back rank opens up.',
      explanation: 'Rxf8+! forces Rxf8, then the back rank is open for another attack, or simply Rxf8# if Black recaptures.',
    },
    {
      id: 'cm-puzzle-3',
      fen: '6k1/5ppp/8/6Q1/8/8/8/6K1 w - - 0 1',
      solutionMoves: ['g5g7'],
      playerColor: 'white',
      hint: 'The queen can give checkmate by capturing on g7.',
      explanation: 'Qxg7# is checkmate! The queen lands on g7 with check and the king has no escape.',
    },
    {
      id: 'cm-puzzle-4',
      fen: '6rk/6pp/8/7N/8/8/8/6K1 w - - 0 1',
      solutionMoves: ['h5f6'],
      playerColor: 'white',
      hint: 'The knight delivers smothered mate — it jumps over the pieces.',
      explanation: 'Nf6#! A smothered mate — the knight delivers check and the king is surrounded by its own rook and pawns on h7 and g7.',
    },
    {
      id: 'cm-puzzle-5',
      fen: '5k2/4R3/5K2/8/8/8/8/8 w - - 0 1',
      solutionMoves: ['e7e8'],
      playerColor: 'white',
      hint: 'The rook can deliver checkmate on the back rank.',
      explanation: 'Re8# checkmate! The rook covers the entire back rank and the king has nowhere to go.',
    },
  ],
}
