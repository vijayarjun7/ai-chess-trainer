import type { TrainerLesson } from '@/types/trainer'

export const threatAwarenessLesson: TrainerLesson = {
  id: 'lesson-threat-awareness',
  title: 'Threat Awareness',
  theme: 'threat_awareness',
  description: 'Train your eye to spot threats before your opponent plays them!',

  steps: [
    {
      id: 'ta-step-1',
      title: 'Ask: What is My Opponent Threatening?',
      fen: 'rnbqkbnr/ppp2ppp/3p4/4p3/4P3/3P4/PPP2PPP/RNBQKBNR w KQkq - 0 4',
      explanation:
        'Before every move, stop and ask: "What is my opponent threatening right now?" If you can answer that question every turn, you will blunder far less.',
      coachSpeech:
        'Here is the single most important habit in chess: before you make YOUR move, look at what your OPPONENT just did. What are they threatening? What is their plan? If you can figure that out first, you will almost never get surprised.',
      highlights: [],
      arrows: [],
    },
    {
      id: 'ta-step-2',
      title: 'One-Move Threats',
      fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/4P3/8/PPPP1PPP/RNB1KBNR w KQkq - 4 4',
      explanation:
        'A one-move threat is when your opponent can win something on the very next move if you ignore it. Checkmate threats and piece captures are the most dangerous one-movers.',
      coachSpeech:
        'A one-move threat is an alarm bell! If you do not respond, you lose something big on the very next move. Always scan for checkmate threats first, then look for free piece captures. These are emergencies!',
      highlights: ['h5', 'f7'],
      arrows: [
        { from: 'h5', to: 'f7', color: '#dc2626' },
      ],
    },
    {
      id: 'ta-step-3',
      title: 'Two-Move Threats',
      fen: 'rnbqkb1r/pppp1ppp/5n2/4p3/4P3/3P4/PPP2PPP/RNBQKBNR w KQkq - 1 4',
      explanation:
        'Stronger players think two moves ahead — "if my opponent plays X, then Y wins." Recognising a two-move threat gives you time to disrupt their plan.',
      coachSpeech:
        'Level two threat spotting! Your opponent is not just threatening what they can do RIGHT NOW — they have a plan. Can you see what their next TWO moves will be? If you can disrupt the plan early, you never have to deal with the threat at all!',
      highlights: [],
      arrows: [],
    },
    {
      id: 'ta-step-4',
      title: 'Candidate Moves',
      fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 5 4',
      explanation:
        'When you find a threat, think about ALL the ways you can answer it — not just the first one that comes to mind. List your candidate moves and pick the best one.',
      coachSpeech:
        'When there is a threat, do not panic and play the first thing you see! List your options: Can I block the threat? Can I capture the attacker? Can I move the target? Can I counter-attack? Look at all your choices, then pick the best one calmly.',
      highlights: [],
      arrows: [],
    },
    {
      id: 'ta-step-5',
      title: 'Spot the Threat and Respond!',
      fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 5 4',
      explanation:
        'The White queen is on h5 and the White bishop is on c4. Together they are threatening checkmate on f7! Black must stop it immediately.',
      coachSpeech:
        'Emergency! The White queen on h5 and bishop on c4 are teaming up. Together they threaten Qxf7 checkmate! Black must find a way to stop this threat right now. Can you find the defensive move?',
      highlights: ['h5', 'c4', 'f7'],
      arrows: [
        { from: 'h5', to: 'f7', color: '#dc2626' },
        { from: 'c4', to: 'f7', color: '#dc2626' },
      ],
      question: 'Black must defend f7 — which move stops the checkmate threat?',
      expectedAnswer: 'g7g6',
    },
  ],

  puzzles: [
    {
      id: 'ta-puzzle-1',
      fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 5 4',
      solutionMoves: ['g7g6'],
      playerColor: 'black',
      hint: 'Drive the queen away from h5 to stop the checkmate threat on f7.',
      explanation: 'g6! attacks the White queen and stops the Scholar\'s Mate threat on f7. The queen must retreat.',
    },
    {
      id: 'ta-puzzle-2',
      fen: '4k3/4r3/8/8/8/8/4R3/4K3 w - - 0 1',
      solutionMoves: ['e2e7'],
      playerColor: 'white',
      hint: 'Find the immediate one-move threat.',
      explanation: 'Rxe7+! The rook captures the hanging rook with check — a one-move winning shot.',
    },
    {
      id: 'ta-puzzle-3',
      fen: 'rnb1kbnr/pppp1ppp/8/4p3/4P2q/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
      solutionMoves: ['f3e5'],
      playerColor: 'white',
      hint: 'The Black queen is overextended — counter-attack instead of defending.',
      explanation: 'Nxe5! Counter-attack! The Black queen threatens h1 but White ignores it and wins a free pawn while the queen is out of position.',
    },
    {
      id: 'ta-puzzle-4',
      fen: 'r1bqkbnr/ppp2ppp/2np4/4p3/4PP2/8/PPPP2PP/RNBQKBNR w KQkq - 0 4',
      solutionMoves: ['f4e5'],
      playerColor: 'white',
      hint: 'The pawn can capture something in the center.',
      explanation: 'fxe5! Captures the hanging pawn on e5 and opens lines for an attack.',
    },
    {
      id: 'ta-puzzle-5',
      fen: 'r1bqkb1r/pppp1ppp/2n5/4p3/2BnP3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
      solutionMoves: ['f3d4'],
      playerColor: 'white',
      hint: 'There is a knight on d4 attacking multiple pieces — deal with the immediate threat.',
      explanation: 'Nxd4! White must capture the attacking knight before it causes even more damage.',
    },
  ],
}
