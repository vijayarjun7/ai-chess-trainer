import type { TrainerLesson } from '@/types/trainer'

export const pawnStructureLesson: TrainerLesson = {
  id: 'lesson-pawn-structure',
  title: 'Pawn Structure',
  theme: 'pawn_structure',
  description: 'Learn how pawns shape the whole game — passed, doubled, and isolated pawns!',

  steps: [
    {
      id: 'ps-step-1',
      title: 'What is a Passed Pawn?',
      fen: '4k3/8/8/8/8/8/3P4/4K3 w - - 0 1',
      explanation:
        'A passed pawn has no enemy pawns blocking it or standing on the files next to it. Nothing can stop it from marching all the way to the other side and becoming a queen!',
      coachSpeech:
        'A passed pawn is a runaway train! No enemy pawns are blocking it or standing on the neighboring files. Once a pawn passes all enemy pawns, it is just a straight march to the finish line — a new queen!',
      highlights: ['d2'],
      arrows: [
        { from: 'd2', to: 'd4', color: '#16a34a' },
        { from: 'd4', to: 'd6', color: '#16a34a' },
        { from: 'd6', to: 'd8', color: '#16a34a' },
      ],
    },
    {
      id: 'ps-step-2',
      title: 'Support Your Passed Pawn',
      fen: '4k3/8/8/3P4/8/8/8/4K3 w - - 0 1',
      explanation:
        'Bring your king to escort the passed pawn down the board. The king and pawn work as a team — the king protects the pawn while the pawn marches forward.',
      coachSpeech:
        'A passed pawn alone on the board can be caught! Bring your king along as a bodyguard. King and pawn together are almost unstoppable. The king clears the path and the pawn charges ahead.',
      highlights: ['d5', 'e1'],
      arrows: [
        { from: 'e1', to: 'e2', color: '#16a34a' },
        { from: 'e2', to: 'e3', color: '#16a34a' },
        { from: 'e3', to: 'd4', color: '#16a34a' },
      ],
    },
    {
      id: 'ps-step-3',
      title: 'Doubled Pawns are Weak',
      fen: '4k3/8/8/8/8/3P4/3P4/4K3 w - - 0 1',
      explanation:
        'Doubled pawns are two pawns on the same file. They cannot protect each other, and the back pawn is blocked by its own twin. Avoid creating doubled pawns unless you get something good in return!',
      coachSpeech:
        'Doubled pawns are like two people walking in a single-file hallway — the one behind cannot help the one in front! They are both stuck, cannot guard each other, and are easy targets for the enemy. Try to avoid creating them.',
      highlights: ['d2', 'd3'],
      arrows: [
        { from: 'd3', to: 'd2', color: '#dc2626' },
      ],
    },
    {
      id: 'ps-step-4',
      title: 'Isolated Pawns Need Help',
      fen: '4k3/8/8/8/3P4/8/8/4K3 w - - 0 1',
      explanation:
        'An isolated pawn has no friendly pawns on the files next to it. It cannot be protected by another pawn and needs pieces to defend it. In the endgame, isolated pawns are easy targets.',
      coachSpeech:
        'An isolated pawn is a lonely pawn! No friendly pawns on the c or e files means this pawn can only be protected by pieces — which ties them down to babysitting duty. Enemy pieces can attack it again and again.',
      highlights: ['d4', 'c3', 'c4', 'c5', 'e3', 'e4', 'e5'],
      arrows: [
        { from: 'e5', to: 'd4', color: '#dc2626' },
      ],
    },
    {
      id: 'ps-step-5',
      title: 'Advance Your Passed Pawn!',
      fen: '4k3/8/8/8/8/8/3P4/4K3 w - - 0 1',
      explanation:
        'White has a passed pawn on d2. The fastest way to get it to the queening square is to push it two squares straight away. Every move the pawn advances, it gets closer to becoming a queen.',
      coachSpeech:
        'You have a passed pawn on d2! It has a clear highway all the way to d8. Push it forward now — every move it advances is one move closer to a brand new queen. How far can you push it this turn?',
      highlights: ['d2', 'd8'],
      arrows: [
        { from: 'd2', to: 'd4', color: '#16a34a' },
      ],
      question: 'Where should the White passed pawn move to advance quickly?',
      expectedAnswer: 'd2d4',
    },
  ],

  puzzles: [
    {
      id: 'ps-puzzle-1',
      fen: '4k3/8/8/8/8/8/3P4/4K3 w - - 0 1',
      solutionMoves: ['d2d4'],
      playerColor: 'white',
      hint: 'Pawns can move two squares on their first move — use it!',
      explanation: 'd4! Advance the passed pawn two squares immediately. The faster the pawn moves, the sooner it promotes to a queen.',
    },
    {
      id: 'ps-puzzle-2',
      fen: '8/3P4/8/8/8/8/8/k1K5 w - - 0 1',
      solutionMoves: ['d7d8q'],
      playerColor: 'white',
      hint: 'The pawn is one square from queening — push it!',
      explanation: 'd8=Q! The passed pawn promotes to a queen. White now has a massive material advantage.',
    },
    {
      id: 'ps-puzzle-3',
      fen: '4k3/8/8/2pP4/8/8/8/4K3 w - - 0 1',
      solutionMoves: ['d5d6'],
      playerColor: 'white',
      hint: 'Advance the d-pawn — it is further ahead than the Black c-pawn.',
      explanation: 'd6! White starts the pawn race. The d-pawn is on the 5th rank vs Black\'s c-pawn on the 5th rank — White promotes one move earlier.',
    },
    {
      id: 'ps-puzzle-4',
      fen: '8/8/8/3k4/8/3P4/8/3K4 w - - 0 1',
      solutionMoves: ['d1e2'],
      playerColor: 'white',
      hint: 'Activate the king — it needs to escort the passed pawn.',
      explanation: 'Ke2! The king marches up to support the d-pawn. If White pushes the pawn immediately, Black Kxd3 captures it. The king leads first.',
    },
    {
      id: 'ps-puzzle-5',
      fen: '4k3/8/8/4P3/3p4/8/8/4K3 w - - 0 1',
      solutionMoves: ['e5e6'],
      playerColor: 'white',
      hint: 'White\'s pawn is further ahead — advance it now.',
      explanation: 'e6! White\'s e-pawn is on the 5th rank, Black\'s d-pawn is on the 4th. White pushes first and wins the promotion race.',
    },
  ],
}
