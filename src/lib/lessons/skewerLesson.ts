import type { TrainerLesson } from '@/types/trainer'

export const skewerLesson: TrainerLesson = {
  id: 'lesson-skewers',
  title: 'The Skewer',
  theme: 'skewers',
  description: 'Learn the skewer — like a reverse pin that wins material!',

  steps: [
    {
      id: 'skewer-step-1',
      title: 'Pin vs Skewer',
      fen: '4k3/8/8/8/8/8/8/R3K3 w Q - 0 1',
      explanation:
        'A pin attacks a less valuable piece that shields a more valuable one. A skewer is the OPPOSITE — you attack the MORE valuable piece first, and when it moves, you capture the piece behind it.',
      coachSpeech:
        'Think of a skewer like a kebab! You put the biggest, most important piece on the end of the stick first, and when it runs away, you eat the smaller piece behind it. It is the reverse of a pin!',
      highlights: ['a1'],
      arrows: [
        { from: 'a1', to: 'e1', color: '#dc2626' },
      ],
    },
    {
      id: 'skewer-step-2',
      title: 'The King Skewer',
      fen: '4k3/8/8/8/8/8/8/R3K3 w Q - 0 1',
      explanation:
        'The most common skewer targets the king. You attack the king with check — it must move — and then you capture the valuable piece that was hiding behind it.',
      coachSpeech:
        'Check the king! The king has to move out of check. But wait — there is a rook or queen hiding behind the king! Once the king steps aside, you grab that piece. Surprise!',
      highlights: ['e8'],
      arrows: [
        { from: 'a1', to: 'e1', color: '#dc2626' },
        { from: 'e1', to: 'e8', color: '#dc2626' },
      ],
    },
    {
      id: 'skewer-step-3',
      title: 'Diagonal Skewer',
      fen: '2k5/8/4q3/8/8/1B6/8/4K3 w - - 0 1',
      explanation:
        'Skewers work on diagonals too! Bishops and queens can skewer on diagonal lines. Attack the king or queen, it moves, and you take what was hiding behind.',
      coachSpeech:
        'Bishops love diagonal skewers! Look how the White bishop can attack the Black queen on e6. When the queen moves, the bishop might have a second target hiding behind it on the same diagonal. Always look behind!',
      highlights: ['b3', 'e6'],
      arrows: [
        { from: 'b3', to: 'e6', color: '#dc2626' },
      ],
    },
    {
      id: 'skewer-step-4',
      title: 'Spot the Hidden Target',
      fen: '4k3/4r3/8/8/8/8/8/R3K3 w Q - 0 1',
      explanation:
        'Before you play a skewer, check what is on the other side of the target piece. If nothing valuable is behind it, the skewer just gives a check with no bonus. Look for the hidden target first!',
      coachSpeech:
        'Always peek behind the curtain before you play a skewer! Ask yourself: if this piece runs away, what is left for me to take? If the answer is something good — a queen, rook, or bishop — then the skewer is worth it!',
      highlights: ['e7', 'e8'],
      arrows: [
        { from: 'a1', to: 'e1', color: '#16a34a' },
        { from: 'e1', to: 'e7', color: '#dc2626' },
        { from: 'e7', to: 'e8', color: '#f97316' },
      ],
    },
    {
      id: 'skewer-step-5',
      title: 'Find the Skewer!',
      fen: '3rk3/8/8/8/8/8/8/R3K3 w Q - 0 1',
      explanation:
        'White rook is on a1. The Black king is on e8 and a Black rook is on d8. Find the skewer — check the king so it must flee, then take the rook.',
      coachSpeech:
        'Your turn! The White rook is on a1. The Black king is on e8 with a rook on d8. Can you find the move that checks the king and wins the rook behind it?',
      highlights: ['a1', 'e8', 'd8'],
      arrows: [],
      question: 'Which move skewers the Black king and wins the rook?',
      expectedAnswer: 'a1e1',
    },
  ],

  puzzles: [
    {
      id: 'skewer-puzzle-1',
      fen: '3rk3/8/8/8/8/8/8/R3K3 w Q - 0 1',
      solutionMoves: ['a1e1'],
      playerColor: 'white',
      hint: 'Check the king along the e-file — the rook is hiding behind it.',
      explanation: 'Re1+! skewers the king. After Kd7, White plays Rxd1 winning the rook.',
    },
    {
      id: 'skewer-puzzle-2',
      fen: '4k3/4r3/8/8/8/8/8/4RK2 w - - 0 1',
      solutionMoves: ['e1e7'],
      playerColor: 'white',
      hint: 'Attack the rook — something valuable is behind it.',
      explanation: 'Rxe7+! skewers the rook against the king. The king must move and White wins material.',
    },
    {
      id: 'skewer-puzzle-3',
      fen: '2k5/2r5/8/8/8/5B2/8/4K3 w - - 0 1',
      solutionMoves: ['f3b7'],
      playerColor: 'white',
      hint: 'Diagonal attack on the rook — king is behind it.',
      explanation: 'Bb7+! skewers the rook on c7. After the king moves, White takes the rook.',
    },
    {
      id: 'skewer-puzzle-4',
      fen: 'k7/1q6/8/8/8/8/6R1/4K3 w - - 0 1',
      solutionMoves: ['g2g7'],
      playerColor: 'white',
      hint: 'Attack the queen — the king is right behind it.',
      explanation: 'Rg7! skewers the queen on b7. The queen must move or be taken, and then the rook controls the 7th rank.',
    },
    {
      id: 'skewer-puzzle-5',
      fen: '4k3/8/4q3/8/8/8/8/4RK2 w - - 0 1',
      solutionMoves: ['e1e6'],
      playerColor: 'white',
      hint: 'Attack the queen — it cannot run without losing the king.',
      explanation: 'Rxe6+! The queen is skewered. If the queen takes, the king is exposed. The queen must move and White wins.',
    },
  ],
}
