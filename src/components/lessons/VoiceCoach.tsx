'use client'

import { useState, useEffect, useRef } from 'react'

interface VoiceCoachProps {
  text: string
  autoPlay?: boolean
}

export function VoiceCoach({ text, autoPlay = false }: VoiceCoachProps) {
  const [speaking, setSpeaking] = useState(false)
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window)
  }, [])

  const stop = () => {
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }

  const speak = (t: string) => {
    stop()
    const utterance = new SpeechSynthesisUtterance(t)
    utterance.rate = 0.88
    utterance.pitch = 1.05
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(utterance)
    setSpeaking(true)
  }

  // Re-read when text changes (e.g. new demo step)
  useEffect(() => {
    if (autoPlay && supported && text) speak(text)
    return () => { if (supported) window.speechSynthesis.cancel() }
  }, [text, autoPlay, supported])

  // Clean up on unmount
  useEffect(() => {
    return () => { if (supported) window.speechSynthesis.cancel() }
  }, [supported])

  if (!supported) return null

  return (
    <button
      onClick={() => (speaking ? stop() : speak(text))}
      title={speaking ? 'Stop voice' : 'Read aloud'}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors shrink-0 ${
        speaking
          ? 'bg-brand-100 border-brand-300 text-brand-700'
          : 'border-gray-200 text-gray-500 hover:border-brand-300 hover:text-brand-700'
      }`}
    >
      {speaking ? '⏹ Stop' : '🔊 Listen'}
    </button>
  )
}
