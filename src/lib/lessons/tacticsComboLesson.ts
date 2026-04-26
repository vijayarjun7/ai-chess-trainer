import type { TrainerLesson } from '@/types/trainer'

export const tacticsComboLesson: TrainerLesson = {
  id: 'lesson-tactics-combo',
  title: 'Combination Play',
  theme: 'tactics_combo',
  description: 'Chain tactics together — remove a defender, then strike for a devastating combination!',

  steps: [
    {
      id: 'tc-step-1',
      title: 'What is a Combination?',
      fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 4 4',
      explanation:
        'A combination is a sequence of two or more forced moves that wins material or delivers checkmate. You play one strong move that creates a threat, then follow up with another — your opponent cannot stop both.',
      coachSpeech:
        'A combination is like a one-two punch in boxing! You do not just play one good move — you play a series of moves that your opponent cannot escape from. Each move creates a new threat until the opponent runs out of answers.',
      highlights: [],
      arrows: [],
    },
    {
      id: 'tc-step-2',
      title: 'Remove the Defender',
      fen: 'r2qkb1r/ppp2ppp/2np1n2/4p1B1/4P3/2N5/PPPP1PPP/R2QKB1R w KQkq - 2 6',
      explanation:
        'Sometimes a piece is defended by exactly ONE other piece. Remove that defender and the original piece falls! This is called "removing the defender" or "undermining."',
      coachSpeech:
        'Imagine a knight is protected by only one piece. If you can capture or distract that one protector, the knight is suddenly free for the taking! This tactic is called removing the defender — eliminate the guard, then take the target.',
      highlights: ['d6', 'c6'],
      arrows: [
        { from: 'g5', to: 'f6', color: '#dc2626' },
        { from: 'g5', to: 'd8', color: '#f97316' },
      ],
    },
    {
      id: 'tc-step-3',
      title: 'Deflection — Lure Away the Guard',
      fen: '4k3/3r4/8/3Q4/8/8/8/4K3 w - - 0 1',
      explanation:
        'Deflection means forcing an important enemy piece to move away from a square it is guarding. Once deflected, the square it was defending becomes vulnerable.',
      coachSpeech:
        'Deflection is like tricking the goalkeeper into running to the corner while you shoot at the open goal! You make an offer that the enemy piece cannot refuse — it has to move — and then you score on what it was protecting.',
      highlights: ['d7', 'd8'],
      arrows: [
        { from: 'd5', to: 'd7', color: '#dc2626' },
        { from: 'd7', to: 'd8', color: '#f97316' },
      ],
    },
    {
      id: 'tc-step-4',
      title: 'Discovered Attack',
      fen: '4k3/8/8/3N4/8/1b6/8/B3K3 w - - 0 1',
      explanation:
        'A discovered attack happens when you move one piece and it reveals an attack from a piece behind it. Moving the front piece often creates TWO threats at once — the moved piece and the revealed attack.',
      coachSpeech:
        'A discovered attack is a sneak attack! You move one piece out of the way and suddenly a piece behind it is attacking something. The opponent might not even see it coming. Two threats at once — that is very hard to handle!',
      highlights: ['d5', 'f6', 'b3', 'b2'],
      arrows: [
        { from: 'd5', to: 'f6', color: '#dc2626' },
        { from: 'a1', to: 'b2', color: '#f97316' },
      ],
    },
    {
      id: 'tc-step-5',
      title: 'Build Your Combination!',
      fen: '4k3/3r4/8/3Q4/8/8/8/4K3 w - - 0 1',
      explanation:
        'White queen is on d5. The Black rook on d7 is the only defender of d8. If you can attack the rook and force it to move, the d8 square is open. Find the move that starts the winning combination.',
      coachSpeech:
        'The Black rook on d7 is the only thing protecting d8! If you attack the rook with your queen, it must move — and then the d8 square is empty. One powerful queen move creates two threats. Can you see it?',
      highlights: ['d5', 'd7', 'd8'],
      arrows: [
        { from: 'd5', to: 'd7', color: '#dc2626' },
      ],
      question: 'Which queen move attacks the rook and threatens to use d8?',
      expectedAnswer: 'd5d7',
    },
  ],

  puzzles: [
    {
      id: 'tc-puzzle-1',
      fen: '4k3/3r4/8/3Q4/8/8/8/4K3 w - - 0 1',
      solutionMoves: ['d5d7'],
      playerColor: 'white',
      hint: 'Attack the rook — it is the only defender of d8.',
      explanation: 'Qxd7+! removes the defender. After the king must move, White continues with the queen dominating the board.',
    },
    {
      id: 'tc-puzzle-2',
      fen: 'r1b1kb1r/ppppqppp/2n5/4p3/4P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 4 5',
      solutionMoves: ['f3e5'],
      playerColor: 'white',
      hint: 'The knight can capture a pawn that is only defended by the queen.',
      explanation: 'Nxe5! Wins a pawn. If Qxe5, Nd5 forks the queen and rook — a two-step combination!',
    },
    {
      id: 'tc-puzzle-3',
      fen: 'r3k3/ppp2ppp/2n5/4q3/8/2N2N2/PPP2PPP/R2QK2R w KQkq - 0 9',
      solutionMoves: ['f3e5'],
      playerColor: 'white',
      hint: 'Capture the queen — it is undefended!',
      explanation: 'Nxe5! The Black queen on e5 is hanging. White wins the queen for a knight — a huge material gain.',
    },
    {
      id: 'tc-puzzle-4',
      fen: '4k3/8/8/3N4/8/1b6/8/B3K3 w - - 0 1',
      solutionMoves: ['d5f6'],
      playerColor: 'white',
      hint: 'Move the knight to reveal a hidden attack from behind.',
      explanation: 'Nf6+! The knight gives check to the king and reveals the White bishop on a1 attacking the Black bishop on b2. After the king moves, White wins the bishop.',
    },
    {
      id: 'tc-puzzle-5',
      fen: 'r1bqkb1r/pppp1Bpp/2n2n2/4p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 4',
      solutionMoves: ['c6d4'],
      playerColor: 'black',
      hint: 'Fork the bishop and attack a new target at the same time.',
      explanation: 'Nd4! The knight forks the bishop on f3 and attacks other squares simultaneously — a forcing combination.',
    },
  ],
}
