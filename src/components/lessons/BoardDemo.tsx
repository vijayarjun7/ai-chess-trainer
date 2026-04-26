'use client'

import { useState } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import type { DemoStep } from '@/types/database'

interface BoardDemoProps {
  startFen: string
  steps: DemoStep[]
  onStepChange?: (stepIndex: number, explanation: string) => void
}

export function BoardDemo({ startFen, steps, onStepChange }: BoardDemoProps) {
  const [stepIndex, setStepIndex] = useState(-1)
  const [fen, setFen] = useState(startFen)

  const currentStep = stepIndex >= 0 ? steps[stepIndex] : null

  const buildFenAtStep = (targetIndex: number): string => {
    const chess = new Chess(startFen)
    for (let i = 0; i <= targetIndex; i++) {
      const s = steps[i]
      if (s.move) {
        chess.move({ from: s.move.slice(0, 2), to: s.move.slice(2, 4), promotion: s.move[4] ?? 'q' })
      }
    }
    return chess.fen()
  }

  const goTo = (next: number) => {
    const newFen = next < 0 ? startFen : buildFenAtStep(next)
    setFen(newFen)
    setStepIndex(next)
    if (next >= 0) onStepChange?.(next, steps[next].explanation)
  }

  const customSquareStyles: Record<string, React.CSSProperties> = {}
  for (const sq of currentStep?.highlights ?? []) {
    customSquareStyles[sq] = { backgroundColor: 'rgba(59, 130, 246, 0.45)' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const arrows: any[] = (currentStep?.arrows ?? []).map(
    ([f, t, c]) => [f, t, c ?? '#16a34a']
  )

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full max-w-[480px]">
        <Chessboard
          position={fen}
          arePiecesDraggable={false}
          customSquareStyles={customSquareStyles}
          customArrows={arrows}
          customBoardStyle={{ borderRadius: '8px', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}
          customDarkSquareStyle={{ backgroundColor: '#b58863' }}
          customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
        />
      </div>

      {/* Step explanation bubble */}
      <div className="min-h-[56px] w-full max-w-[480px] text-center px-2">
        {stepIndex === -1 ? (
          <p className="text-gray-400 text-sm">Press Next to start the board demonstration</p>
        ) : (
          <p className="text-gray-800 text-sm leading-relaxed">
            <span className="font-semibold text-brand-600">Step {stepIndex + 1}: </span>
            {steps[stepIndex].san && (
              <span className="font-mono text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded mr-1">
                {steps[stepIndex].san}
              </span>
            )}
            {steps[stepIndex].explanation}
          </p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => goTo(stepIndex - 1)}
          disabled={stepIndex < 0}
          className="px-5 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-30 hover:border-brand-400 transition-colors"
        >
          ← Prev
        </button>
        <span className="text-xs text-gray-400 min-w-[60px] text-center">
          {stepIndex + 1} / {steps.length}
        </span>
        <button
          onClick={() => goTo(stepIndex + 1)}
          disabled={stepIndex >= steps.length - 1}
          className="px-5 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium disabled:opacity-30 hover:bg-brand-700 transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
