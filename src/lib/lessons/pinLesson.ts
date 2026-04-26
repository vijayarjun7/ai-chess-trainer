import type { TrainerLesson } from '@/types/trainer'

export const pinLesson: TrainerLesson = {
  id: 'lesson-pins',
  title: 'The Pin',
  theme: 'pins',
  description: 'Learn how to freeze enemy pieces in place using pins!',

  steps: [
    {
      id: 'pin-step-1',
      title: 'What is a Pin?',
      fen: 'rnbqkbnr/ppp2ppp/3p4/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq - 0 3',
      explanation:
        'A pin is when you attack a piece that cannot move because it is shielding a more valuable piece behind it. The pinned piece is stuck!',
      coachSpeech:
        'Imagine being stuck in one spot because your boss is standing right behind you! That is a pin. The piece in front cannot move, or something even more valuable gets captured.',
      highlights: ['c4'],
      arrows: [
        { from: 'c4', to: 'e6', color: '#dc2626' },
      ],
    },
    {
      id: 'pin-step-2',
      title: 'Absolute Pin',
      fen: 'rnbqk1nr/ppp2ppp/3p4/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq - 0 3',
      explanation:
        'An absolute pin is when the piece behind the pinned piece is the KING. The pinned piece literally cannot move — it would be illegal to expose the king to check!',
      coachSpeech:
        'This is the strongest kind of pin. The White bishop on c4 is aiming straight at the Black king! Any piece between them is absolutely frozen — it cannot move at all. The rules of chess will not allow it.',
      highlights: ['c4', 'e6', 'e8'],
      arrows: [
        { from: 'c4', to: 'e8', color: '#dc2626' },
      ],
    },
    {
      id: 'pin-step-3',
      title: 'Relative Pin',
      fen: 'rnb1kbnr/ppp2ppp/3p4/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq - 0 3',
      explanation:
        'A relative pin is when the piece behind is very valuable — like a queen — but not the king. The pinned piece CAN move, but doing so loses material. Smart players respect relative pins!',
      coachSpeech:
        'A relative pin is more like a strong suggestion. The piece can technically move, but it would be a terrible idea! If the pinned piece steps away, you lose something big behind it. Most players avoid that.',
      highlights: ['c4', 'd6'],
      arrows: [
        { from: 'c4', to: 'd5', color: '#f97316' },
      ],
    },
    {
      id: 'pin-step-4',
      title: 'Exploit the Pin',
      fen: 'r1bqk1nr/ppp2ppp/2np4/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 5',
      explanation:
        'Once a piece is pinned, pile on pressure! Move other pieces to attack the pinned piece repeatedly. Since it cannot run, it will fall.',
      coachSpeech:
        'A pinned piece is a sitting duck! The classic trick is to attack it again and again with pawns and minor pieces. The pinned piece cannot escape, so eventually it gets captured.',
      highlights: ['c6'],
      arrows: [
        { from: 'd3', to: 'd4', color: '#16a34a' },
        { from: 'c4', to: 'c6', color: '#dc2626' },
      ],
    },
    {
      id: 'pin-step-5',
      title: 'Breaking a Pin',
      fen: 'r1bqk1nr/ppp2ppp/2np4/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R b KQkq - 0 5',
      explanation:
        'If YOU are pinned, you can try to break it: block the line with another piece, capture the attacker, or move the piece behind the pin out of the line of fire.',
      coachSpeech:
        'Being pinned feels terrible, but you can escape! Either block the attack with another piece, chase away the pinner, or move your valuable piece off the line. Break the pin and fight back!',
      highlights: [],
      arrows: [
        { from: 'e8', to: 'd7', color: '#16a34a' },
      ],
      question: 'How can Black break the pin on the knight at c6?',
      expectedAnswer: 'e8d7',
    },
  ],

  puzzles: [
    {
      id: 'pin-puzzle-1',
      fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
      solutionMoves: ['c4f7'],
      playerColor: 'white',
      hint: 'The bishop can strike a piece that is pinned to the king.',
      explanation: 'Bxf7+! wins a pawn and disrupts the king. The f6 knight was pinned and the king was exposed.',
    },
    {
      id: 'pin-puzzle-2',
      fen: '4k3/4n3/8/8/2B5/8/8/4K3 w - - 0 1',
      solutionMoves: ['c4e6'],
      playerColor: 'white',
      hint: 'Pin the knight to the king along the diagonal.',
      explanation: 'Be6! pins the knight on e7 against the king on e8. The knight cannot move.',
    },
    {
      id: 'pin-puzzle-3',
      fen: '4k3/3qn3/8/8/5B2/8/8/4K3 w - - 0 1',
      solutionMoves: ['f4b8'],
      playerColor: 'white',
      hint: 'Pin a piece against the king with your bishop.',
      explanation: 'Bb8! pins the queen on d6 or the knight on e7 against the king — winning material.',
    },
    {
      id: 'pin-puzzle-4',
      fen: 'r4rk1/ppp2ppp/2nqbn2/3p4/3P4/2NBPN2/PPP2PPP/R2QK2R w KQ - 0 9',
      solutionMoves: ['d1b3'],
      playerColor: 'white',
      hint: 'Place your queen to pin the knight on c6 against something valuable.',
      explanation: 'Qb3! threatens the d5 pawn and eyes the c6 knight along the diagonal.',
    },
    {
      id: 'pin-puzzle-5',
      fen: '4k3/4r3/8/8/1B6/8/8/4K3 w - - 0 1',
      solutionMoves: ['b4e7'],
      playerColor: 'white',
      hint: 'Pin the rook to the king.',
      explanation: 'Be7! pins the rook on e7 against the king — the rook is lost.',
    },
  ],
}
