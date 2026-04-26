'use client'

import type { ExtractionResult } from '@/types/tournament'
import { Card } from '@/components/ui/Card'
import { useState } from 'react'

interface Props {
  result:    ExtractionResult
  isManual?: boolean
}

export function ExtractionStatus({ result, isManual }: Props) {
  const [showRaw, setShowRaw] = useState(false)
  const pct  = Math.round(result.confidence * 100)
  const high = result.confidence >= 0.85
  const low  = result.confidence < 0.6

  if (isManual) return null  // no status bar for manual paste

  return (
    <Card padding="sm" className="mb-4">
      <div className="flex items-center gap-3">
        <span className="text-lg">{high ? '✅' : low ? '⚠️' : '🔍'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-gray-700">Extraction confidence</span>
            <span className={`text-sm font-bold ${high ? 'text-green-600' : low ? 'text-red-600' : 'text-yellow-600'}`}>
              {pct}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${high ? 'bg-green-500' : low ? 'bg-red-500' : 'bg-yellow-400'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {result.warnings.length > 0 && (
        <ul className="mt-2 space-y-1">
          {result.warnings.map((w, i) => (
            <li key={i} className="text-xs text-yellow-700 bg-yellow-50 rounded px-2 py-1">
              ⚠ {w}
            </li>
          ))}
        </ul>
      )}

      {low && (
        <p className="mt-2 text-xs text-red-600 bg-red-50 rounded px-2 py-1.5">
          Low confidence — please review all moves carefully before confirming.
        </p>
      )}

      {result.rawText && (
        <button
          onClick={() => setShowRaw(v => !v)}
          className="mt-2 text-xs text-gray-400 hover:text-gray-600 underline"
        >
          {showRaw ? 'Hide' : 'Show'} raw extracted text
        </button>
      )}
      {showRaw && result.rawText && (
        <pre className="mt-1 text-[11px] text-gray-500 bg-gray-50 rounded p-2 overflow-x-auto whitespace-pre-wrap">
          {result.rawText}
        </pre>
      )}
    </Card>
  )
}
