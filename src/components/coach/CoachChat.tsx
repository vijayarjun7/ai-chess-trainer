'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import type { ChatMessage } from '@/lib/ai/types'
import type { Student } from '@/types/database'

interface CoachChatProps {
  student: Student
  gameId?: string
  initialMessages?: ChatMessage[]
  skillTags?: string[]
}

export function CoachChat({ student, gameId, initialMessages = [], skillTags = [] }: CoachChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: ChatMessage = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          gameId,
          skillTags,
        }),
      })

      const data = await res.json()
      setMessages(prev => [...prev, { role: 'coach', content: data.reply }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'coach',
        content: 'I had trouble answering that. Please try again!',
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 p-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <p className="text-3xl mb-2">♟️</p>
            <p className="text-sm">Ask your coach anything about chess!</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
              msg.role === 'user'
                ? 'bg-brand-600 text-white'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {msg.role === 'coach' && (
                <p className="text-xs font-semibold mb-1 text-brand-600">Coach</p>
              )}
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 p-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={student.explanation_mode === 'simple'
            ? 'Ask your coach anything!'
            : 'Ask a chess question…'}
          className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          disabled={loading}
        />
        <Button size="sm" onClick={sendMessage} loading={loading} disabled={!input.trim()}>
          Send
        </Button>
      </div>
    </div>
  )
}
