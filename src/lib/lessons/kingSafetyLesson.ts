import type { TrainerLesson } from '@/types/trainer'

export const kingSafetyLesson: TrainerLesson = {
  id: 'lesson-king-safety',
  title: 'King Safety',
  theme: 'king_safety',
  description: 'Keep your king safe by castling and maintaining a strong pawn shield!',

  steps: [
    {
      id: 'ks-step-1',
      title: 'Why King Safety Matters',
      fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1',
      explanation:
        'In the opening and middlegame the king is in danger in the center. Piece attacks, open files, and diagonals all threaten the king. Getting your king to safety is one of the most important tasks in the opening.',
      coachSpeech:
        'Your king is your most important piece — if it gets checkmated, you lose the game! In the opening, pieces are flying all over the board and the king stuck in the middle is an easy target. You need to get your king to safety fast!',
      highlights: ['e1'],
      arrows: [],
    },
    {
      id: 'ks-step-2',
      title: 'Castling Kingside',
      fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5NB1/PPPP1PPP/RNBQK2R w KQkq - 2 4',
      explanation:
        'Castling kingside (O-O) moves the king two squares toward the h-file and jumps the rook over it to f1. The king lands safely behind the f, g, h pawns — a natural fortress.',
      coachSpeech:
        'Castling kingside is the most popular way to castle. One move and your king hides behind three pawns while the rook comes to the center. Two tasks, one move — brilliant!',
      highlights: ['e1', 'h1', 'g1', 'f1'],
      arrows: [
        { from: 'e1', to: 'g1', color: '#16a34a' },
        { from: 'h1', to: 'f1', color: '#16a34a' },
      ],
    },
    {
      id: 'ks-step-3',
      title: 'Pawn Shield',
      fen: 'rnbqr1k1/ppp2ppp/3p1n2/4p3/4P3/3PBN2/PPP2PPP/R2QR1K1 w - - 4 9',
      explanation:
        'After castling, the pawns on f2, g2, and h2 form your king\'s shield. Keep them advanced only when necessary — they block enemy pieces from reaching your king.',
      coachSpeech:
        'See those three pawns in front of the king? They are your king\'s bodyguards! Try not to push them unless you have a good reason. A broken pawn shield is like leaving your king\'s front door wide open.',
      highlights: ['g1', 'f2', 'g2', 'h2'],
      arrows: [],
    },
    {
      id: 'ks-step-4',
      title: 'Open Files are Dangerous',
      fen: 'r4rk1/ppp2ppp/2nqbn2/3p4/3P4/2NBPN2/PPP2PPP/R2QK2R w KQ - 0 9',
      explanation:
        'An open file pointing at your king is very dangerous — enemy rooks and queens can use it to attack. Always think about whether an open or semi-open file threatens your king.',
      coachSpeech:
        'Open files are highways for rooks and queens! If an enemy rook lands on an open file pointing at your king, your king is in serious danger. Castle away from open files whenever you can, and try to close them or block them.',
      highlights: ['e1'],
      arrows: [
        { from: 'e8', to: 'e1', color: '#dc2626' },
      ],
    },
    {
      id: 'ks-step-5',
      title: 'Castle to Safety!',
      fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5NB1/PPPP1PPP/RNBQK2R w KQkq - 2 4',
      explanation:
        'White has developed the knight and bishop and the path is clear for kingside castling. Castle now to tuck the king away safely and connect the rooks.',
      coachSpeech:
        'Everything is in place! The knight is out, the bishop is active, and the path between the king and rook is clear. It is the perfect time to castle kingside. Move the king to safety!',
      highlights: ['e1', 'g1', 'h1', 'f1'],
      arrows: [
        { from: 'e1', to: 'g1', color: '#16a34a' },
      ],
      question: 'White is ready to castle kingside. What is the castling move?',
      expectedAnswer: 'e1g1',
    },
  ],

  puzzles: [
    {
      id: 'ks-puzzle-1',
      fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5NB1/PPPP1PPP/RNBQK2R w KQkq - 2 4',
      solutionMoves: ['e1g1'],
      playerColor: 'white',
      hint: 'Castle to safety — the path is clear.',
      explanation: 'O-O (castling kingside) tucks the king safely behind the pawn shield and activates the rook.',
    },
    {
      id: 'ks-puzzle-2',
      fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 4 5',
      solutionMoves: ['e1g1'],
      playerColor: 'white',
      hint: 'Both sides have developed — castle before the center opens.',
      explanation: 'O-O! Getting the king out of the center before the position opens up is critical for king safety.',
    },
    {
      id: 'ks-puzzle-3',
      fen: 'r2qkb1r/ppp2ppp/2np1n2/4p3/2B1P1b1/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 4 6',
      solutionMoves: ['e1g1'],
      playerColor: 'white',
      hint: 'The center is about to explode — find safety now.',
      explanation: 'O-O! With the g4 bishop attacking and the center tension, castling kingside immediately is the safest option.',
    },
    {
      id: 'ks-puzzle-4',
      fen: 'r1bq1rk1/pppp1ppp/2n2n2/4p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQ - 6 6',
      solutionMoves: ['e1g1'],
      playerColor: 'white',
      hint: 'Black has already castled — catch up!',
      explanation: 'O-O! Black castled on the previous move. White should castle immediately to match and not fall behind in development.',
    },
    {
      id: 'ks-puzzle-5',
      fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/2N2N2/PPPPBPPP/R1BQK2R w KQkq - 4 5',
      solutionMoves: ['e1g1'],
      playerColor: 'white',
      hint: 'Bishop on e2 means the kingside is clear — castle!',
      explanation: 'O-O! With the bishop on e2 the path is clear. Castling now avoids any danger in the opening.',
    },
  ],
}
