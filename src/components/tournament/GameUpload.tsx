'use client'

import { useRef, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { parseManualInput } from '@/lib/tournament/extractNotation'
import type { ExtractionResult } from '@/types/tournament'

interface Props {
  onExtracted: (result: ExtractionResult, isManual: boolean) => void
  loading:     boolean
}

export function GameUpload({ onExtracted, loading }: Props) {
  const fileInputRef   = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [pasteText, setPasteText]     = useState('')
  const [dragOver, setDragOver]       = useState(false)
  const [showPaste, setShowPaste]     = useState(false)
  const [pasteError, setPasteError]   = useState<string | null>(null)

  // ── Image: convert File → base64 then call extraction API ────────────────
  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1]
      await callExtractApi(base64)
    }
    reader.readAsDataURL(file)
  }

  const callExtractApi = async (imageBase64: string) => {
    const res  = await fetch('/api/tournament/extract', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ imageBase64 }),
    })
    const data = await res.json()
    if (data.moves) onExtracted(data as ExtractionResult, false)
  }

  // ── File picker ────────────────────────────────────────────────────────────
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  // ── Drag-and-drop ──────────────────────────────────────────────────────────
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  // ── Manual paste ───────────────────────────────────────────────────────────
  const handlePasteSubmit = () => {
    setPasteError(null)
    const moves = parseManualInput(pasteText)
    if (moves.length === 0) { setPasteError('No moves found. Enter SAN moves like: 1. e4 e5 2. Nf3 Nc6'); return }
    onExtracted(
      { moves, rawText: pasteText, confidence: 1, warnings: [] },
      true,
    )
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'
        }`}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="text-4xl animate-bounce">🔍</div>
            <p className="text-sm font-medium text-gray-600">Extracting moves from image…</p>
          </div>
        ) : (
          <>
            <div className="text-5xl mb-3">📄</div>
            <p className="text-sm font-semibold text-gray-700">Drop scoresheet image here</p>
            <p className="text-xs text-gray-400 mt-1">or click to browse — JPG, PNG, PDF</p>
          </>
        )}
        <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={onFileChange} />
      </div>

      {/* Camera */}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          className="flex-1"
          disabled={loading}
          onClick={() => cameraInputRef.current?.click()}
        >
          📷 Take Photo
        </Button>
        <Button
          variant="secondary"
          className="flex-1"
          disabled={loading}
          onClick={() => setShowPaste(v => !v)}
        >
          ✏️ Type / Paste
        </Button>
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={onFileChange}
        />
      </div>

      {/* Manual paste panel */}
      {showPaste && (
        <Card padding="sm" className="border-brand-100">
          <p className="text-xs text-gray-500 mb-2">
            Paste or type moves in any format — move numbers and annotations are stripped automatically.
          </p>
          <p className="text-[11px] text-gray-400 mb-2 font-mono">
            Example: 1. e4 e5 2. Nf3 Nc6 3. Bb5 a6
          </p>
          <textarea
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
            placeholder="Paste notation here…"
            rows={4}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
          />
          {pasteError && (
            <p className="text-xs text-red-600 mt-1">{pasteError}</p>
          )}
          <Button
            className="w-full mt-2"
            size="sm"
            disabled={!pasteText.trim() || loading}
            onClick={handlePasteSubmit}
          >
            Use These Moves
          </Button>
        </Card>
      )}
    </div>
  )
}
