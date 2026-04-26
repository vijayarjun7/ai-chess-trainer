'use client'

import { ChessBoard } from '@/components/chess/ChessBoard'
import { fenAfterMoves } from '@/lib/tournament/validateMoves'

interface Props {
  moves:            string[]   // only valid moves
  currentIndex:     number     // 0 = start, N = after move N
  playerColor:      'white' | 'black'
  onIndexChange:    (index: number) => void
}

export function GamePreviewBoard({ moves, currentIndex, playerColor, onIndexChange }: Props) {
  const fen     = fenAfterMoves(moves, currentIndex)
  const total   = moves.length
  const canPrev = currentIndex > 0
  const canNext = currentIndex < total

  // Current move label e.g. "5... Nf3"
  let moveLabel = 'Start'
  if (currentIndex > 0) {
    const idx     = currentIndex - 1
    const moveNum = Math.floor(idx / 2) + 1
    const color   = idx % 2 === 0 ? '.' : '…'
    moveLabel     = `${moveNum}${color} ${moves[idx]}`
  }

  return (
    <div className="space-y-3">
      <ChessBoard
        fen={fen}
        playerColor={playerColor}
        disabled       // preview only — no interaction
        showCoordinates
      />

      {/* Nav controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onIndexChange(0)}
          disabled={!canPrev}
          className="px-2 py-1.5 rounded-lg border text-sm font-mono disabled:opacity-30 hover:bg-gray-50"
          title="Start"
        >
          ⏮
        </button>
        <button
          onClick={() => onIndexChange(currentIndex - 1)}
          disabled={!canPrev}
          className="px-2 py-1.5 rounded-lg border text-sm font-mono disabled:opacity-30 hover:bg-gray-50"
          title="Previous"
        >
          ◀
        </button>

        <span className="flex-1 text-center text-sm font-mono text-gray-600 min-w-0 truncate">
          {moveLabel}
        </span>

        <button
          onClick={() => onIndexChange(currentIndex + 1)}
          disabled={!canNext}
          className="px-2 py-1.5 rounded-lg border text-sm font-mono disabled:opacity-30 hover:bg-gray-50"
          title="Next"
        >
          ▶
        </button>
        <button
          onClick={() => onIndexChange(total)}
          disabled={!canNext}
          className="px-2 py-1.5 rounded-lg border text-sm font-mono disabled:opacity-30 hover:bg-gray-50"
          title="End"
        >
          ⏭
        </button>
      </div>

      {/* Progress scrubber */}
      <input
        type="range"
        min={0}
        max={total}
        value={currentIndex}
        onChange={e => onIndexChange(parseInt(e.target.value))}
        className="w-full accent-brand-600"
      />

      <div className="flex justify-between text-[11px] text-gray-400">
        <span>Move 0</span>
        <span className="text-gray-600 font-medium">{currentIndex} / {total}</span>
        <span>Move {total}</span>
      </div>
    </div>
  )
}
