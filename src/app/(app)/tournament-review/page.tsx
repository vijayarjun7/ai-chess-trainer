'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { GameUpload }        from '@/components/tournament/GameUpload'
import { ExtractionStatus }  from '@/components/tournament/ExtractionStatus'
import { MoveEditor }        from '@/components/tournament/MoveEditor'
import { GamePreviewBoard }  from '@/components/tournament/GamePreviewBoard'
import { validateMoveSequence, detectResult } from '@/lib/tournament/validateMoves'
import { buildPgn }          from '@/lib/tournament/pgnBuilder'
import { useProfile }        from '@/hooks/useProfile'
import type { ExtractionResult, ValidationResult, GameResultPgn } from '@/types/tournament'

type Step = 'upload' | 'edit'

const STEPS = ['Upload', 'Edit & Verify', 'Analyse']

export default function TournamentReviewPage() {
  const router        = useRouter()
  const { student }   = useProfile()

  const [step,         setStep]         = useState<Step>('upload')
  const [extracting,   setExtracting]   = useState(false)
  const [extraction,   setExtraction]   = useState<ExtractionResult | null>(null)
  const [isManual,     setIsManual]     = useState(false)

  const [moves,        setMoves]        = useState<string[]>([])
  const [validation,   setValidation]   = useState<ValidationResult | null>(null)
  const [previewIndex, setPreviewIndex] = useState(0)

  const [playerColor,  setPlayerColor]  = useState<'white' | 'black'>('white')
  const [gameResult,   setGameResult]   = useState<GameResultPgn>('*')
  const [eventName,    setEventName]    = useState('')

  const [saving,       setSaving]       = useState(false)
  const [saveError,    setSaveError]    = useState<string | null>(null)

  // Re-validate whenever moves change
  useEffect(() => {
    if (moves.length === 0) { setValidation(null); return }
    const result = validateMoveSequence(moves)
    setValidation(result)
    // Auto-detect result from game state
    if (result.valid) {
      const detected = detectResult(moves)
      setGameResult(detected)
    }
    // Keep preview index in bounds
    setPreviewIndex(idx => Math.min(idx, result.validUpToIndex))
  }, [moves])

  const handleExtracted = useCallback((result: ExtractionResult, manual: boolean) => {
    setExtracting(false)
    setExtraction(result)
    setIsManual(manual)
    setMoves(result.moves)
    setStep('edit')
  }, [])

  const handleUploadStart = () => setExtracting(true)

  const handleAnalyse = async () => {
    if (!validation?.valid) return
    setSaveError(null)
    setSaving(true)

    const pgn = buildPgn(moves, {
      event:  eventName || 'Tournament',
      result: gameResult,
    })

    if (!pgn) {
      setSaveError('Could not build PGN — please recheck your moves.')
      setSaving(false)
      return
    }

    try {
      const res = await fetch('/api/games', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          pgn,
          player_color:   playerColor,
          opponent_style: 'tournament',
          ai_level:       1,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        setSaveError(err.error ?? 'Could not save game. Are you signed in?')
        setSaving(false)
        return
      }

      const { game } = await res.json()
      router.push(`/analysis/${game.id}`)
    } catch {
      setSaveError('Network error — please try again.')
      setSaving(false)
    }
  }

  const validMoves = validation?.valid ? moves : moves.slice(0, validation?.validUpToIndex ?? 0)

  return (
    <div className="page-container pb-24 sm:pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">🏆</span>
        <div>
          <h1 className="section-title mb-0">Tournament Game Review</h1>
          <p className="text-sm text-gray-500">Upload your scoresheet and get AI coaching feedback</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {STEPS.map((label, i) => {
          const stepIndex = step === 'upload' ? 0 : 1
          const done      = i < stepIndex
          const current   = i === stepIndex || (saving && i === 2)
          return (
            <div key={label} className="flex items-center gap-2 min-w-0">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                done    ? 'bg-green-500 text-white' :
                current ? 'bg-brand-600 text-white' :
                          'bg-gray-100 text-gray-400'
              }`}>
                {done ? '✓' : i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:inline ${current ? 'text-brand-700' : done ? 'text-green-600' : 'text-gray-400'}`}>
                {label}
              </span>
              {i < STEPS.length - 1 && <div className="w-6 h-px bg-gray-200 shrink-0" />}
            </div>
          )
        })}
      </div>

      {/* ── Step 1: Upload ── */}
      {step === 'upload' && (
        <div className="max-w-lg mx-auto">
          <Card>
            <CardTitle>Upload Scoresheet</CardTitle>
            <p className="text-sm text-gray-500 mb-5">
              Take a photo, upload an image, or type the moves directly.
            </p>
            <GameUpload
              loading={extracting}
              onExtracted={(result, manual) => {
                handleUploadStart()
                // Short tick so extracting spinner shows before async work
                setTimeout(() => handleExtracted(result, manual), 0)
              }}
            />
          </Card>
        </div>
      )}

      {/* ── Step 2: Edit & Preview ── */}
      {step === 'edit' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Editor */}
          <div className="space-y-4">
            {extraction && (
              <ExtractionStatus result={extraction} isManual={isManual} />
            )}

            <Card>
              <div className="flex items-center justify-between mb-3">
                <CardTitle className="mb-0">Move List</CardTitle>
                <button
                  onClick={() => { setStep('upload'); setMoves([]); setExtraction(null) }}
                  className="text-xs text-gray-400 hover:text-gray-600 underline"
                >
                  Start over
                </button>
              </div>

              <MoveEditor
                moves={moves}
                validation={validation}
                currentMoveIndex={previewIndex}
                onChange={setMoves}
                onIndexChange={setPreviewIndex}
              />
            </Card>

            {/* Game settings */}
            <Card padding="sm">
              <p className="text-sm font-semibold text-gray-700 mb-3">Game settings</p>
              <div className="space-y-3">
                {/* Player color */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">I played as</label>
                  <div className="flex gap-2">
                    {(['white', 'black'] as const).map(c => (
                      <button
                        key={c}
                        onClick={() => setPlayerColor(c)}
                        className={`flex-1 py-2 rounded-xl border text-sm font-medium capitalize transition-colors ${
                          playerColor === c
                            ? 'border-brand-500 bg-brand-50 text-brand-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        {c === 'white' ? '♙' : '♟'} {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Result */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Result</label>
                  <div className="flex gap-2 flex-wrap">
                    {([['1-0', 'White wins'], ['0-1', 'Black wins'], ['1/2-1/2', 'Draw'], ['*', 'Unknown']] as const).map(([val, label]) => (
                      <button
                        key={val}
                        onClick={() => setGameResult(val)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          gameResult === val
                            ? 'border-brand-500 bg-brand-50 text-brand-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Event name */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Event name <span className="text-gray-300">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={eventName}
                    onChange={e => setEventName(e.target.value)}
                    placeholder="e.g. School Chess Championship"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                </div>
              </div>
            </Card>

            {/* Analyse button */}
            {saveError && (
              <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{saveError}</p>
            )}

            {!student && (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                ⚠ Sign in to save this game and get full AI coaching feedback.
              </p>
            )}

            <Button
              className="w-full"
              size="lg"
              disabled={!validation?.valid || saving || !student}
              loading={saving}
              onClick={handleAnalyse}
            >
              {saving ? 'Saving…' : '🔍 Analyse This Game'}
            </Button>
          </div>

          {/* Right: Board preview */}
          <div>
            <Card>
              <CardTitle className="mb-3">Board Preview</CardTitle>
              {validMoves.length > 0 ? (
                <GamePreviewBoard
                  moves={validMoves}
                  currentIndex={previewIndex}
                  playerColor={playerColor}
                  onIndexChange={setPreviewIndex}
                />
              ) : (
                <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                  Add valid moves to see the board
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
