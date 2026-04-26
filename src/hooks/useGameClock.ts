'use client'

import { useEffect, useRef, useState } from 'react'

export function useGameClock(
  initialSeconds: number | null,
  isWhiteTurn: boolean,
  gameOver: boolean,
  onTimeout: (loser: 'white' | 'black') => void,
) {
  const [white, setWhite] = useState(initialSeconds ?? 0)
  const [black, setBlack] = useState(initialSeconds ?? 0)
  const fired = useRef(false)

  // Reset when a new game starts (initialSeconds changes)
  useEffect(() => {
    setWhite(initialSeconds ?? 0)
    setBlack(initialSeconds ?? 0)
    fired.current = false
  }, [initialSeconds])

  useEffect(() => {
    if (!initialSeconds || gameOver) return
    const id = setInterval(() => {
      if (isWhiteTurn) {
        setWhite(t => {
          const n = Math.max(0, t - 1)
          if (n === 0 && !fired.current) { fired.current = true; onTimeout('white') }
          return n
        })
      } else {
        setBlack(t => {
          const n = Math.max(0, t - 1)
          if (n === 0 && !fired.current) { fired.current = true; onTimeout('black') }
          return n
        })
      }
    }, 1000)
    return () => clearInterval(id)
  }, [initialSeconds, isWhiteTurn, gameOver, onTimeout])

  return { white, black }
}

export function fmtTime(s: number): string {
  const m   = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}
