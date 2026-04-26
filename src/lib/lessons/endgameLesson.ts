import type { TrainerLesson } from '@/types/trainer'

export const endgameLesson: TrainerLesson = {
  id: 'lesson-endgame-basics',
  title: 'Endgame Basics',
  theme: 'endgame_basics',
  description: 'Master the endgame: activate your king, promote pawns, and deliver checkmate!',

  steps: [
    {
      id: 'eg-step-1',
      title: 'Wake Up Your King!',
      fen: '8/8/8/3k4/8/3P4/8/3K4 w - - 0 1',
      explanation:
        'In the endgame the queen, rooks, and most pieces are traded off. Now the king becomes a powerful fighting piece! March it toward the center to support your pawns and attack the enemy.',
      coachSpeech:
        'During the opening and middlegame the king hides behind pawns and stays safe. But in the endgame — with most pieces gone — the king wakes up! It becomes an attacker and a bodyguard at the same time. March it forward!',
      highlights: ['d1'],
      arrows: [
        { from: 'd1', to: 'd2', color: '#16a34a' },
        { from: 'd2', to: 'd3', color: '#16a34a' },
        { from: 'd3', to: 'e4', color: '#16a34a' },
      ],
    },
    {
      id: 'eg-step-2',
      title: 'The Opposition',
      fen: '8/8/3k4/8/3K4/8/3P4/8 w - - 0 1',
      explanation:
        'Opposition is when two kings face each other with one square between them. The player who does NOT have the move has the opposition — a key advantage in king-and-pawn endgames.',
      coachSpeech:
        'Opposition is a tricky chess secret! When two kings stare at each other with one square between them, the king that does NOT have to move controls the situation. It forces the other king to step aside. Use opposition to escort your pawn to promotion!',
      highlights: ['d4', 'd6'],
      arrows: [
        { from: 'd4', to: 'd5', color: '#16a34a' },
      ],
    },
    {
      id: 'eg-step-3',
      title: 'Promote the Pawn',
      fen: '2k5/3P4/3K4/8/8/8/8/8 w - - 0 1',
      explanation:
        'When your pawn reaches the 8th rank it promotes — you replace it with a queen, rook, bishop, or knight. Almost always choose the queen, the most powerful piece!',
      coachSpeech:
        'Your pawn is one step from the finish line! When it crosses to the other side, it transforms into any piece you choose. Pick the queen every time — it is the most powerful piece on the board. This is called pawn promotion and it often wins the game instantly!',
      highlights: ['d7', 'd8'],
      arrows: [
        { from: 'd7', to: 'd8', color: '#16a34a' },
      ],
    },
    {
      id: 'eg-step-4',
      title: 'Rook + King Checkmate',
      fen: 'k7/8/1K6/8/8/8/8/7R w - - 0 1',
      explanation:
        'A rook and king can force checkmate against a lone king. Drive the enemy king to the edge of the board — kings on the edge have fewer escape squares. Then deliver checkmate along the back rank or file.',
      coachSpeech:
        'Rook plus king against a lone king is a winning endgame every time — but you have to know how! Push the enemy king to the corner. The edge of the board is your best friend because the king has nowhere to run. Then the rook delivers the final blow!',
      highlights: ['a8', 'h1', 'b6'],
      arrows: [
        { from: 'h1', to: 'a1', color: '#dc2626' },
        { from: 'a1', to: 'a8', color: '#dc2626' },
      ],
    },
    {
      id: 'eg-step-5',
      title: 'Find the Checkmate!',
      fen: 'k7/8/1K6/8/8/8/8/7R w - - 0 1',
      explanation:
        'White rook is on h1. The Black king is trapped in the corner on a8. The White king on b6 covers a7 and b7. Find the one move that delivers checkmate!',
      coachSpeech:
        'The Black king is cornered on a8! The White king on b6 is blocking the escape to a7 and b7. There is only one move — rook swings to the 8th rank and it is checkmate. Can you find it?',
      highlights: ['a8', 'h1', 'b6'],
      arrows: [
        { from: 'h1', to: 'h8', color: '#dc2626' },
      ],
      question: 'Where does the White rook move to deliver checkmate?',
      expectedAnswer: 'h1h8',
    },
  ],

  puzzles: [
    {
      id: 'eg-puzzle-1',
      fen: 'k7/8/1K6/8/8/8/8/7R w - - 0 1',
      solutionMoves: ['h1h8'],
      playerColor: 'white',
      hint: 'The rook belongs on the 8th rank — the king has nowhere to go.',
      explanation: 'Rh8# checkmate! The rook covers the entire 8th rank. The Black king on a8 cannot escape because the White king on b6 controls a7 and b7.',
    },
    {
      id: 'eg-puzzle-2',
      fen: '2k5/3P4/3K4/8/8/8/8/8 w - - 0 1',
      solutionMoves: ['d7d8q'],
      playerColor: 'white',
      hint: 'One square from a queen — promote!',
      explanation: 'd8=Q! Pawn promotes to a queen. The Black king on c8 cannot capture because it is defended by the White king on d6.',
    },
    {
      id: 'eg-puzzle-3',
      fen: '8/8/3k4/8/3K4/8/3P4/8 w - - 0 1',
      solutionMoves: ['d4d5'],
      playerColor: 'white',
      hint: 'Step directly toward the Black king — gain the opposition.',
      explanation: 'Kd5! White gains the opposition. Black king must yield — stepping aside lets White\'s king escort the pawn forward to promotion.',
    },
    {
      id: 'eg-puzzle-4',
      fen: '6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1',
      solutionMoves: ['a1a8'],
      playerColor: 'white',
      hint: 'The rook belongs on the back rank — the Black king is trapped.',
      explanation: 'Ra8# checkmate! Back-rank mate. The Black king on g8 is trapped by its own pawns on f7, g7, h7 and the rook covers the entire 8th rank.',
    },
    {
      id: 'eg-puzzle-5',
      fen: '8/8/8/3k4/8/3P4/8/3K4 w - - 0 1',
      solutionMoves: ['d1e2'],
      playerColor: 'white',
      hint: 'The king must march up — if you push the pawn now Black captures it.',
      explanation: 'Ke2! King activates. If White plays d4 immediately, Black Kxd3 wins the pawn. The king must lead first to support the pawn\'s advance.',
    },
  ],
}
