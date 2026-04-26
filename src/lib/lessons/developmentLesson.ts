import type { TrainerLesson } from '@/types/trainer'

export const developmentLesson: TrainerLesson = {
  id: 'lesson-development',
  title: 'Opening Principles',
  theme: 'development',
  description: 'Master the three golden rules of the opening: control the center, develop pieces, castle!',

  steps: [
    {
      id: 'dev-step-1',
      title: 'Control the Center',
      fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
      explanation:
        'The center — the e4, d4, e5, d5 squares — is the most important part of the board. Pieces in the center control more squares and attack in all directions. Fight for the center from move one!',
      coachSpeech:
        'The center of the chessboard is like the highest ground in a battle. Whoever controls it controls the whole board. Always try to place your pawns and pieces in or near the center in the opening.',
      highlights: ['e4', 'd4', 'e5', 'd5'],
      arrows: [
        { from: 'e2', to: 'e4', color: '#16a34a' },
        { from: 'd2', to: 'd4', color: '#16a34a' },
      ],
    },
    {
      id: 'dev-step-2',
      title: 'Develop Knights Before Bishops',
      fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
      explanation:
        'Knights need more moves to reach good squares than bishops. Develop your knights to f3 and c3 (or f6 and c6) first — they control the center and open lines for the bishops.',
      coachSpeech:
        'Knights are a bit slow — they need to hop around to get to a good spot. That is why you develop them first! The classic squares are c3 and f3 for White, and c6 and f6 for Black. Get those knights out early!',
      highlights: ['f3'],
      arrows: [
        { from: 'g1', to: 'f3', color: '#16a34a' },
        { from: 'b1', to: 'c3', color: '#16a34a' },
      ],
    },
    {
      id: 'dev-step-3',
      title: 'Do Not Move the Same Piece Twice',
      fen: 'rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
      explanation:
        'Each move you waste moving the same piece again is a move your opponent uses to develop a new piece. You will quickly be outnumbered in the opening if you do this!',
      coachSpeech:
        'There is a famous chess rule: do not move the same piece twice in the opening unless you have a really good reason! Every move should bring a new piece into the game. Wasting moves gives your opponent a head start.',
      highlights: [],
      arrows: [],
    },
    {
      id: 'dev-step-4',
      title: 'Castle Early',
      fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 4 4',
      explanation:
        'Once you have developed your knights and bishops, castle to get your king to safety and connect your rooks. A king in the center during the middlegame is a liability.',
      coachSpeech:
        'Knights are out — bishops are out — time to castle! Get that king tucked away behind the pawns and connect your rooks. A king stuck in the center is asking for trouble when the board opens up.',
      highlights: ['e1'],
      arrows: [
        { from: 'e1', to: 'g1', color: '#16a34a' },
      ],
    },
    {
      id: 'dev-step-5',
      title: 'Your Opening Sequence!',
      fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',
      explanation:
        'White played e4, Black played e5. Now White should develop a knight to f3, following the opening principles. It attacks the e5 pawn and controls the center.',
      coachSpeech:
        'Great opening by both sides — both controlled the center! Now what? Develop a knight, of course. The knight on f3 controls d4 and e5, putting immediate pressure on Black. What is the right move?',
      highlights: ['f3', 'g1'],
      arrows: [
        { from: 'g1', to: 'f3', color: '#16a34a' },
      ],
      question: 'Which piece should White develop and where?',
      expectedAnswer: 'g1f3',
    },
  ],

  puzzles: [
    {
      id: 'dev-puzzle-1',
      fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',
      solutionMoves: ['g1f3'],
      playerColor: 'white',
      hint: 'Develop a knight to the best central square.',
      explanation: 'Nf3! The classic developing move. The knight attacks e5 and controls d4, following opening principles.',
    },
    {
      id: 'dev-puzzle-2',
      fen: 'rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
      solutionMoves: ['f1c4'],
      playerColor: 'white',
      hint: 'Develop your bishop to the most active diagonal.',
      explanation: 'Bc4! The Italian Game — the bishop targets the weak f7 square and gets developed to an active diagonal.',
    },
    {
      id: 'dev-puzzle-3',
      fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
      solutionMoves: ['f1b5'],
      playerColor: 'white',
      hint: 'Pin the knight with your bishop — this is the Ruy Lopez.',
      explanation: 'Bb5! The Ruy Lopez! The bishop pins the knight that defends the e5 pawn, creating long-term pressure.',
    },
    {
      id: 'dev-puzzle-4',
      fen: 'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
      solutionMoves: ['e1g1'],
      playerColor: 'white',
      hint: 'Pieces are developed — now do the third opening task.',
      explanation: 'O-O! Castling is the third opening principle. King is safe and rooks can be connected.',
    },
    {
      id: 'dev-puzzle-5',
      fen: 'rnbqkbnr/ppp2ppp/3p4/4p3/4P3/3P4/PPP2PPP/RNBQKBNR w KQkq - 0 4',
      solutionMoves: ['b1c3'],
      playerColor: 'white',
      hint: 'Develop your queenside knight to the natural central square.',
      explanation: 'Nc3! Develops the knight to its best square, supporting the center and preparing for more development.',
    },
  ],
}
