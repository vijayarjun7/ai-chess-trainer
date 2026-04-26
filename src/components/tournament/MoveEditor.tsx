'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import type { ValidationResult } from '@/types/tournament'

interface Props {
  moves:             string[]
  validation:        ValidationResult | null
  currentMoveIndex:  number
  onChange:          (moves: string[]) => void
  onIndexChange:     (index: number) => void
}

export function MoveEditor({ moves, validation, currentMoveIndex, onChange, onIndexChange }: Props) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [draftValue,   setDraftValue]   = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingIndex !== null) inputRef.current?.focus()
  }, [editingIndex])

  const startEdit = (index: number) => {
    setEditingIndex(index)
    setDraftValue(moves[index] ?? '')
  }

  const commitEdit = (index: number) => {
    const trimmed = draftValue.trim()
    const next    = [...moves]
    if (trimmed) {
      next[index] = trimmed
    } else {
      next.splice(index, 1)
    }
    onChange(next)
    setEditingIndex(null)
  }

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault()
      commitEdit(index)
      // Move to next move
      const nextIdx = index + 1
      if (nextIdx < moves.length) setTimeout(() => startEdit(nextIdx), 0)
    }
    if (e.key === 'Escape') {
      setEditingIndex(null)
    }
  }

  const addMove = () => {
    const next = [...moves, '']
    onChange(next)
    setEditingIndex(next.length - 1)
    setDraftValue('')
  }

  const removeMove = (index: number) => {
    const next = moves.filter((_, i) => i !== index)
    onChange(next)
    if (editingIndex !== null && editingIndex >= next.length) setEditingIndex(null)
  }

  // Group moves into pairs: [[white, black?], ...]
  const pairs: Array<{ white: string; black?: string; wIdx: number; bIdx: number | null }> = []
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({ white: moves[i], black: moves[i + 1], wIdx: i, bIdx: i + 1 < moves.length ? i + 1 : null })
  }

  const isInvalid = (index: number) =>
    validation && !validation.valid && index >= validation.validUpToIndex

  const renderMove = (san: string, index: number) => {
    const invalid   = isInvalid(index)
    const isCurrent = index === currentMoveIndex - 1

    if (editingIndex === index) {
      return (
        <input
          ref={inputRef}
          value={draftValue}
          onChange={e => setDraftValue(e.target.value)}
          onBlur={() => commitEdit(index)}
          onKeyDown={e => onKeyDown(e, index)}
          className="w-16 px-1.5 py-0.5 text-sm font-mono border-2 border-brand-400 rounded focus:outline-none bg-white"
        />
      )
    }

    return (
      <button
        onClick={() => { onIndexChange(index + 1); startEdit(index) }}
        title={invalid ? (validation?.errorMessage ?? '') : 'Click to edit'}
        className={`px-2 py-0.5 text-sm font-mono rounded transition-colors ${
          invalid
            ? 'bg-red-100 text-red-700 border border-red-300'
            : isCurrent
            ? 'bg-brand-100 text-brand-700 border border-brand-200'
            : 'hover:bg-gray-100 text-gray-800 border border-transparent'
        }`}
      >
        {san || <span className="text-gray-300">?</span>}
        {invalid && <span className="ml-0.5 text-red-500">✗</span>}
      </button>
    )
  }

  return (
    <div className="space-y-3">
      {/* Error banner */}
      {validation && !validation.valid && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
          <span className="text-red-500 mt-0.5 shrink-0">⚠</span>
          <p className="text-sm text-red-700">{validation.errorMessage}</p>
        </div>
      )}

      {validation?.valid && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
          <span className="text-green-500">✓</span>
          <p className="text-sm text-green-700 font-medium">
            All {moves.length} moves valid — ready to analyse
          </p>
        </div>
      )}

      {/* Move grid */}
      <div className="bg-gray-50 rounded-xl p-3 max-h-72 overflow-y-auto">
        <p className="text-[10px] text-gray-400 mb-2 uppercase tracking-wide">
          Click any move to edit · Tab to advance · Backspace to clear
        </p>
        <div className="space-y-1">
          {pairs.map((pair, pairIdx) => (
            <div key={pairIdx} className="flex items-center gap-1 min-w-0">
              <span className="text-xs text-gray-400 font-mono w-6 text-right shrink-0">
                {pairIdx + 1}.
              </span>
              {renderMove(pair.white, pair.wIdx)}
              {pair.bIdx !== null && renderMove(pair.black!, pair.bIdx)}
            </div>
          ))}
          {moves.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">No moves yet. Add a move below.</p>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={addMove} className="text-brand-600">
          + Add move
        </Button>
        {moves.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeMove(moves.length - 1)}
            className="text-red-500"
          >
            Remove last
          </Button>
        )}
      </div>
    </div>
  )
}
