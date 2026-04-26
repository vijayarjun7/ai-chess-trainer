import type { TrainerLesson } from '@/types/trainer'

export const hangingPiecesLesson: TrainerLesson = {
  id: 'lesson-hanging-pieces',
  title: 'Hanging Pieces',
  theme: 'hanging_pieces',
  description: 'Learn to spot undefended pieces before your opponent does!',

  steps: [
    {
      id: 'hang-step-1',
      title: 'What is a Hanging Piece?',
      fen: 'r1bqkb1r/pppp1ppp/2n5/4p1N1/4P3/8/PPPP1PPP/RNBQKB1R w KQkq - 4 4',
      explanation:
        'A hanging piece is a piece that is undefended — no other piece is protecting it. If the opponent attacks it, you lose it for free. Always check if your pieces are safe!',
      coachSpeech:
        'A hanging piece is like leaving your backpack in the middle of the street — anyone can just take it! If your piece has no protection and your opponent attacks it, you are going to lose it. Always make sure your pieces are defended.',
      highlights: ['g5'],
      arrows: [
        { from: 'd8', to: 'g5', color: '#dc2626' },
      ],
    },
    {
      id: 'hang-step-2',
      title: 'Check Before You Move',
      fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',
      explanation:
        'Before every move, ask yourself: "Am I leaving any of my pieces undefended? Can my opponent capture something for free?" This simple habit saves lots of pieces!',
      coachSpeech:
        'Here is a golden habit for every chess player: before you move, look at all your pieces. Are they all safe? Can your opponent take any of them for free? This two-second check will save you from blundering again and again.',
      highlights: [],
      arrows: [],
    },
    {
      id: 'hang-step-3',
      title: 'Winning a Hanging Piece',
      fen: 'r1bqkb1r/pppp1ppp/2n5/4p1N1/4P3/8/PPPP1PPP/RNBQKB1R b KQkq - 4 4',
      explanation:
        'When you spot a hanging piece, capture it immediately! But first check: is it a trap? Make sure capturing does not walk into a bigger problem like a fork, pin, or checkmate.',
      coachSpeech:
        'When you see a free piece — take it! But do not be hasty. Always double-check: is this a trap? Sometimes players leave a piece hanging on purpose to lure you into a worse position. Capture, but verify first!',
      highlights: ['g5'],
      arrows: [
        { from: 'd8', to: 'g5', color: '#16a34a' },
      ],
    },
    {
      id: 'hang-step-4',
      title: 'Defend Your Pieces',
      fen: 'r1bqkb1r/pppp1ppp/2n5/4p3/4P3/2N5/PPPP1PPP/R1BQKB1R w KQkq - 4 4',
      explanation:
        'If one of your pieces is attacked and undefended, you have three choices: move it away, defend it with another piece, or capture the attacker. Choose based on what wins you the most.',
      coachSpeech:
        'Your piece is under attack! What do you do? You have three options. Run away with the piece, bring backup to defend it, or take out the attacker. Think about which choice keeps you winning the most material.',
      highlights: ['c3'],
      arrows: [],
    },
    {
      id: 'hang-step-5',
      title: 'Spot the Hanging Piece!',
      fen: 'r1bqkb1r/pppp1ppp/2n5/4p1N1/4P3/8/PPPP1PPP/RNBQKB1R b KQkq - 4 4',
      explanation:
        'It is Black\'s turn. The White knight on g5 is hanging — not defended by any White piece. Black can capture it for free! Find the free piece.',
      coachSpeech:
        'Your turn! Look at the White knight on g5. Is it defended by anything? No! The queen on d8 can reach it. Capture that hanging knight and win a free piece!',
      highlights: ['g5'],
      arrows: [],
      question: 'Which Black piece can capture the hanging White knight on g5?',
      expectedAnswer: 'd8g5',
    },
  ],

  puzzles: [
    {
      id: 'hang-puzzle-1',
      fen: 'r1bqkb1r/pppp1ppp/2n5/4p1N1/4P3/8/PPPP1PPP/RNBQKB1R b KQkq - 4 4',
      solutionMoves: ['d8g5'],
      playerColor: 'black',
      hint: 'The White knight on g5 is undefended.',
      explanation: 'Qxg5! captures the hanging White knight for free. Always grab free material!',
    },
    {
      id: 'hang-puzzle-2',
      fen: 'r1bqkbnr/ppp2ppp/2np4/4p3/4P3/5N2/PPPPBPPP/RNBQK2R w KQkq - 0 5',
      solutionMoves: ['f3e5'],
      playerColor: 'white',
      hint: 'Look for an undefended pawn in the center.',
      explanation: 'Nxe5! The pawn on e5 was hanging. White wins a central pawn for free.',
    },
    {
      id: 'hang-puzzle-3',
      fen: 'rnb1kbnr/pppp1ppp/8/4p3/4P1q1/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
      solutionMoves: ['f3g5'],
      playerColor: 'white',
      hint: 'The Black queen is overextended and can be attacked.',
      explanation: 'Ng5! attacks the hanging queen on g4. The queen has no support and must retreat, losing a tempo.',
    },
    {
      id: 'hang-puzzle-4',
      fen: 'r1bqkb1r/pppp1ppp/2n2n2/4N3/4P3/8/PPPP1PPP/RNBQKB1R b KQkq - 0 4',
      solutionMoves: ['c6e5'],
      playerColor: 'black',
      hint: 'White left a piece in the center undefended.',
      explanation: 'Nxe5! The knight on e5 was hanging. Black captures it and wins a free piece in the center.',
    },
    {
      id: 'hang-puzzle-5',
      fen: 'rnbqkb1r/pppp1ppp/5n2/4p3/4P3/3P4/PPP2PPP/RNBQKBNR w KQkq - 1 4',
      solutionMoves: ['d3d4'],
      playerColor: 'white',
      hint: 'Attack the hanging pawn in the center.',
      explanation: 'd4! attacks the undefended e5 pawn. Black must defend it or lose it.',
    },
  ],
}
