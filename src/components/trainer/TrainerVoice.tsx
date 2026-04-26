'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface TrainerVoiceProps {
  text: string
  autoPlay?: boolean
  onStart?: () => void
  onEnd?: () => void
}

// ── Voice selection ───────────────────────────────────────────────────────────
// Ordered by quality. Google voices (Chrome) are neural and sound natural.
// Apple voices (Safari/macOS) are also good. Fallback to any English voice.
const VOICE_PRIORITY = [
  'Google UK English Female',
  'Google US English Female',
  'Google UK English Male',
  'Google US English',
  'Microsoft Aria Online (Natural)',
  'Microsoft Jenny Online (Natural)',
  'Microsoft Guy Online (Natural)',
  'Samantha',   // macOS / iOS
  'Karen',      // macOS AU
  'Daniel',     // macOS UK
  'Moira',      // macOS IE
]

function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  for (const name of VOICE_PRIORITY) {
    const v = voices.find(v => v.name.includes(name))
    if (v) return v
  }
  // Any English, non-compact (compact voices are lower quality on macOS)
  return (
    voices.find(v => v.lang.startsWith('en') && !v.name.toLowerCase().includes('compact')) ??
    voices.find(v => v.lang.startsWith('en')) ??
    null
  )
}

// ── Text normalisation ────────────────────────────────────────────────────────
// Converts chess notation into something that sounds natural when spoken.
function normaliseForSpeech(raw: string): string {
  return raw
    // Named piece + square: Nf3 → "Knight F 3"
    .replace(/\bN([a-h][1-8])\b/g, 'Knight $1')
    .replace(/\bB([a-h][1-8])\b/g, 'Bishop $1')
    .replace(/\bR([a-h][1-8])\b/g, 'Rook $1')
    .replace(/\bQ([a-h][1-8])\b/g, 'Queen move $1')
    .replace(/\bK([a-h][1-8])\b/g, 'King $1')
    // Bare squares: e4 → "E 4", d5 → "D 5"
    .replace(/\b([a-h])([1-8])\b/g, (_, f, r) => `${f.toUpperCase()} ${r}`)
    // Castling
    .replace(/\bO-O-O\b/g, 'queen-side castling')
    .replace(/\bO-O\b/g, 'king-side castling')
    // Check / checkmate symbols
    .replace(/\+/g, ', check,')
    .replace(/#/g, ', checkmate!')
    // Common chess shorthand
    .replace(/\bx\b/g, 'captures')
    // Multiple spaces
    .replace(/  +/g, ' ')
    .trim()
}

// ── Sentence chunker ──────────────────────────────────────────────────────────
// Splits text into sentence-sized pieces so each utterance has a natural
// endpoint. The browser's TTS engine handles intonation much better over
// short sentences than over one long wall of text.
function toSentenceChunks(text: string): string[] {
  const raw = text
    .split(/(?<=[.!?])\s+/)   // split AFTER sentence-ending punctuation
    .map(s => s.trim())
    .filter(Boolean)

  // Merge very short sentences (< 40 chars) with the next one so we don't
  // get choppy one-word utterances.
  const chunks: string[] = []
  let buf = ''
  for (const s of raw) {
    buf = buf ? `${buf} ${s}` : s
    if (buf.length >= 40) { chunks.push(buf); buf = '' }
  }
  if (buf) chunks.push(buf)

  return chunks.length ? chunks : [text]
}

// ── Component ─────────────────────────────────────────────────────────────────
export function TrainerVoice({ text, autoPlay = false, onStart, onEnd }: TrainerVoiceProps) {
  const [speaking, setSpeaking]       = useState(false)
  const [paused, setPaused]           = useState(false)
  const [supported, setSupported]     = useState(false)
  const [voices, setVoices]           = useState<SpeechSynthesisVoice[]>([])

  const sessionRef    = useRef(0)          // incremented on every new speak() call
  const chunkIndexRef = useRef(0)          // which chunk we're currently on
  const chunksRef     = useRef<string[]>([])
  const pausedAtRef   = useRef(0)          // chunk index when paused
  const timersRef     = useRef<ReturnType<typeof setTimeout>[]>([])

  // ── Setup ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    setSupported(true)

    const load = () => {
      const v = window.speechSynthesis.getVoices()
      if (v.length) setVoices(v)
    }
    load()
    window.speechSynthesis.onvoiceschanged = load
    return () => { window.speechSynthesis.onvoiceschanged = null }
  }, [])

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  // ── stop ───────────────────────────────────────────────────────────────────
  const stop = useCallback(() => {
    sessionRef.current++
    clearTimers()
    window.speechSynthesis.cancel()
    setSpeaking(false)
    setPaused(false)
  }, [])

  // ── speak (from a given chunk index) ──────────────────────────────────────
  const speakFrom = useCallback((chunks: string[], fromIndex: number, session: number) => {
    const voice = pickVoice(voices)

    const speakChunk = (idx: number) => {
      if (sessionRef.current !== session) return   // stale — stop was called
      if (idx >= chunks.length) {
        setSpeaking(false)
        setPaused(false)
        onEnd?.()
        return
      }

      chunkIndexRef.current = idx
      const utt = new SpeechSynthesisUtterance(chunks[idx])
      utt.rate   = 0.92    // slightly slower than 1.0 — clear but not sluggish
      utt.pitch  = 1.1     // a touch warmer / less flat
      utt.volume = 1
      if (voice) utt.voice = voice

      utt.onend = () => {
        if (sessionRef.current !== session) return
        // Natural inter-sentence pause: 280ms between sentences
        const t = setTimeout(() => speakChunk(idx + 1), 280)
        timersRef.current.push(t)
      }
      utt.onerror = (e) => {
        // 'interrupted' fires when we cancel() — don't treat as real error
        if (e.error === 'interrupted') return
        if (sessionRef.current !== session) return
        setSpeaking(false)
        setPaused(false)
      }

      window.speechSynthesis.speak(utt)
    }

    speakChunk(fromIndex)
  }, [voices, onEnd])

  // ── Public speak ──────────────────────────────────────────────────────────
  const speak = useCallback((raw: string) => {
    if (!supported) return
    const session = ++sessionRef.current
    clearTimers()
    window.speechSynthesis.cancel()

    const normalised = normaliseForSpeech(raw)
    const chunks     = toSentenceChunks(normalised)
    chunksRef.current    = chunks
    chunkIndexRef.current = 0
    pausedAtRef.current   = 0

    setSpeaking(true)
    setPaused(false)
    onStart?.()

    // Tiny delay: let cancel() fully flush before we start speaking
    const t = setTimeout(() => speakFrom(chunks, 0, session), 80)
    timersRef.current.push(t)
  }, [supported, speakFrom, onStart])

  // ── Pause ─────────────────────────────────────────────────────────────────
  const pause = useCallback(() => {
    if (!supported || !speaking || paused) return
    clearTimers()
    window.speechSynthesis.cancel()      // stop current utterance
    pausedAtRef.current = chunkIndexRef.current  // remember where we were
    setPaused(true)
  }, [supported, speaking, paused])

  // ── Resume ────────────────────────────────────────────────────────────────
  const resume = useCallback(() => {
    if (!supported || !paused) return
    const session = ++sessionRef.current
    setSpeaking(true)
    setPaused(false)

    const t = setTimeout(() => speakFrom(chunksRef.current, pausedAtRef.current, session), 80)
    timersRef.current.push(t)
  }, [supported, paused, speakFrom])

  // ── Auto-play on text change ───────────────────────────────────────────────
  useEffect(() => {
    if (autoPlay && supported && voices.length > 0 && text) speak(text)
    return () => {
      sessionRef.current++
      clearTimers()
      if (supported) window.speechSynthesis.cancel()
    }
  }, [text, autoPlay, supported, voices.length]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      sessionRef.current++
      clearTimers()
      if (supported) window.speechSynthesis.cancel()
    }
  }, [supported])

  if (!supported) return null

  return (
    <div className="flex items-center gap-2">
      {!speaking ? (
        <button
          onClick={() => speak(text)}
          title="Play voice"
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-brand-400 hover:text-brand-700 transition-colors"
        >
          <span className="text-base">🔊</span>
          <span>Listen</span>
        </button>
      ) : paused ? (
        <button
          onClick={resume}
          title="Resume"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-100 border border-brand-300 text-sm font-medium text-brand-700 hover:bg-brand-200 transition-colors"
        >
          <span className="text-base">▶️</span>
          <span>Resume</span>
        </button>
      ) : (
        <button
          onClick={pause}
          title="Pause"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-100 border border-brand-300 text-sm font-medium text-brand-700 hover:bg-brand-200 transition-colors"
        >
          <span className="text-base">⏸️</span>
          <span>Pause</span>
        </button>
      )}

      {speaking && (
        <button
          onClick={stop}
          title="Stop"
          className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500 transition-colors"
        >
          ⏹
        </button>
      )}
    </div>
  )
}
