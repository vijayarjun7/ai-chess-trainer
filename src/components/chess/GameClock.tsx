'use client'

import { fmtTime } from '@/hooks/useGameClock'
import type { PlayerColor } from '@/types/database'

interface ClockFaceProps {
  label:     string
  time:      number
  active:    boolean
  compact?:  boolean
}

export function ClockFace({ label, time, active, compact }: ClockFaceProps) {
  const low = time <= 30
  return (
    <div className={`rounded-xl border-2 text-center transition-all ${compact ? 'px-3 py-1' : 'flex-1 px-3 py-2'} ${
      active
        ? low ? 'border-red-400 bg-red-50' : 'border-brand-400 bg-brand-50'
        : 'border-gray-200 bg-gray-50'
    }`}>
      {!compact && (
        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide mb-0.5">{label}</p>
      )}
      <p className={`font-mono font-bold tabular-nums leading-none ${compact ? 'text-lg' : 'text-2xl'} ${
        active ? (low ? 'text-red-600' : 'text-brand-700') : 'text-gray-400'
      }`}>
        {fmtTime(time)}
      </p>
      {compact && (
        <p className="text-[9px] text-gray-400 mt-0.5">{label}</p>
      )}
    </div>
  )
}

// Full sidebar clock (desktop)
interface GameClockProps {
  whiteTime:   number
  blackTime:   number
  isWhiteTurn: boolean
  playerColor: PlayerColor
  gameOver:    boolean
}

export function GameClock({ whiteTime, blackTime, isWhiteTurn, playerColor, gameOver }: GameClockProps) {
  const whiteLabel = playerColor === 'white' ? 'You' : 'Opponent'
  const blackLabel = playerColor === 'black' ? 'You' : 'Opponent'

  return (
    <div className="flex gap-2">
      <ClockFace label={whiteLabel} time={whiteTime} active={isWhiteTurn && !gameOver} />
      <ClockFace label={blackLabel} time={blackTime} active={!isWhiteTurn && !gameOver} />
    </div>
  )
}
