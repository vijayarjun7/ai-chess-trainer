import type { TrainerLesson } from '@/types/trainer'

// Knight Fork Lesson — 5 explanation steps + 5 practice puzzles
export const forkLesson: TrainerLesson = {
  id: 'lesson-knight-fork',
  title: 'The Knight Fork',
  theme: 'Tactics',
  description: 'Learn how a knight can attack two pieces at once — the knight fork!',

  steps: [
    {
      id: 'step-1',
      title: 'Meet the Knight',
      fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
      explanation:
        'The knight is a special piece. It jumps in an L-shape — two squares in one direction, then one square to the side. It can jump over other pieces!',
      coachSpeech:
        'Look at that knight on f3! Knights move in an L-shape. They jump over everyone — like a superhero! Let me show you something cool about them.',
      highlights: ['f3'],
      arrows: [
        { from: 'f3', to: 'e5', color: '#16a34a' },
        { from: 'f3', to: 'g5', color: '#16a34a' },
        { from: 'f3', to: 'd4', color: '#16a34a' },
        { from: 'f3', to: 'h4', color: '#16a34a' },
      ],
    },
    {
      id: 'step-2',
      title: 'What is a Fork?',
      fen: 'r1bqk2r/pppp1ppp/2n2n2/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 4 5',
      explanation:
        'A fork is when one piece attacks TWO enemy pieces at the same time. The opponent can only save one — so you win the other! Knights are amazing at forks because they move in tricky ways.',
      coachSpeech:
        'A fork is like trapping two rabbits at once! You attack two pieces at the same time, and your opponent can only run away with one. That means you capture the other one for free!',
      highlights: [],
      arrows: [],
    },
    {
      id: 'step-3',
      title: 'Spot the Fork Square',
      fen: 'r1b1k2r/ppppqppp/2n5/4p3/4P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 4 6',
      explanation:
        'Before you fork, look for a square your knight can jump to that attacks two valuable pieces at once. Here, the White knight on f3 can jump to d5 — attacking both the Black queen on e7 and the knight on c6!',
      coachSpeech:
        'Can you see it? The White knight can jump to d5! From there it attacks the Black queen AND the Black knight at the same time. That is a fork! Let\'s watch it happen.',
      highlights: ['d5', 'e7', 'c6'],
      arrows: [
        { from: 'f3', to: 'd5', color: '#dc2626' },
        { from: 'd5', to: 'e7', color: '#f97316' },
        { from: 'd5', to: 'c6', color: '#f97316' },
      ],
    },
    {
      id: 'step-4',
      title: 'The Fork in Action',
      fen: 'r1b1k2r/ppppqppp/2n5/3Np3/4P3/2N5/PPPP1PPP/R1BQK2R b KQkq - 5 7',
      explanation:
        'The White knight jumped to d5! Now it attacks both the queen on e7 and the knight on c6. Black must move the queen — and then White captures the knight on c6 for free. That is winning material!',
      coachSpeech:
        'The knight jumped to d5 — fork! Black\'s queen has to run away. Then White grabs the knight on c6 for free. One move, two threats — that is the power of the knight fork!',
      highlights: ['d5', 'e7', 'c6'],
      arrows: [
        { from: 'd5', to: 'e7', color: '#f97316' },
        { from: 'd5', to: 'c6', color: '#f97316' },
      ],
    },
    {
      id: 'step-5',
      title: 'Your Turn to Find the Fork!',
      fen: '4k3/ppp1qppp/2n5/8/4N3/8/PPP2PPP/4K3 w - - 0 1',
      explanation:
        'Now it is your turn! The White knight on e4 can fork the Black queen and knight. Find the square where the knight attacks both pieces at once.',
      coachSpeech:
        'Okay, detective — your turn! The White knight is on e4. Can you find the square where it attacks both the Black queen on e7 and the Black knight on c6? Move the knight to that square!',
      highlights: ['e4', 'e7', 'c6'],
      arrows: [],
      question: 'Where should the White knight jump to fork the queen and the knight?',
      expectedAnswer: 'e4d6',
    },
  ],

  puzzles: [
    {
      id: 'fork-puzzle-1',
      fen: '4k3/ppp1qppp/2n5/8/4N3/8/PPP2PPP/4K3 w - - 0 1',
      solutionMoves: ['e4d6'],
      playerColor: 'white',
      hint: 'The knight needs to land between the queen and the other knight.',
      explanation: 'Nd6! forks the queen on e7 and the knight on c6. Black must save the queen, and White captures the knight.',
    },
    {
      id: 'fork-puzzle-2',
      // White knight on c3, Black king on e8, Black rook on a8 — Nd5 forks king+rook (discovered check variant)
      // Simplified: knight on b1, black king e4, black rook a4 — Nc3 forks both
      fen: '8/8/8/8/r3k3/8/8/1N2K3 w - - 0 1',
      solutionMoves: ['b1c3'],
      playerColor: 'white',
      hint: 'Jump to the square that attacks both the king and the rook.',
      explanation: 'Nc3! attacks the Black king on e4 and the rook on a4 at the same time — a royal fork!',
    },
    {
      id: 'fork-puzzle-3',
      // Knight on f3, Black queen d4, Black king h4 — Ng5 puts king in check and attacks queen? Let's use e5 fork
      // Knight on d3, Black queen b4, Black king f4 — Ne5 forks both? No.
      // Solid: Knight on f1, Black king d2, Black queen b2 — Ne3+ forks king+queen
      fen: '8/8/8/8/1q6/8/3k4/5N1K w - - 0 1',
      solutionMoves: ['f1e3'],
      playerColor: 'white',
      hint: 'Check the king and attack the queen at the same time!',
      explanation: 'Ne3+! checks the Black king on d2 and attacks the queen on b2. Black must move the king, and White takes the queen.',
    },
    {
      id: 'fork-puzzle-4',
      // Knight on g1, Black rook a2, Black king e2 — Nf3 forks both
      fen: '8/8/8/8/8/8/r3k3/6NK w - - 0 1',
      solutionMoves: ['g1f3'],
      playerColor: 'white',
      hint: 'Think about which square your knight can reach that attacks both pieces.',
      explanation: 'Nf3+! forks the Black king on e2 and the rook on a2. After the king moves, White wins the rook.',
    },
    {
      id: 'fork-puzzle-5',
      // Knight on e1, Black queen g2, Black king g4 — Nf3+ forks both
      fen: '8/8/8/8/6k1/8/6q1/4N2K w - - 0 1',
      solutionMoves: ['e1f3'],
      playerColor: 'white',
      hint: 'One jump — two targets. Find the square that checks the king and hits the queen.',
      explanation: 'Nf3+! checks the king on g4 and attacks the queen on g2. The king must flee, and White captures the queen.',
    },
  ],
}
