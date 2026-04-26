'use client'

import { useProfile } from '@/hooks/useProfile'
import { CoachChat } from '@/components/coach/CoachChat'
import { Card } from '@/components/ui/Card'

export default function CoachPage() {
  const { student } = useProfile()

  if (!student) return (
    <div className="page-container flex items-center justify-center min-h-64">
      <p className="text-gray-400">Loading your coach…</p>
    </div>
  )

  const greeting = student.explanation_mode === 'simple'
    ? `Hi ${student.name}! Ask me anything about chess!`
    : `Hello ${student.name}. I'm your chess coach. What would you like to discuss?`

  return (
    <div className="page-container pb-20 sm:pb-8">
      <h1 className="section-title">Coach Chat</h1>
      <p className="section-sub">Ask anything about chess, your games, or how to improve</p>

      <Card padding="none" className="h-[70vh] flex flex-col">
        <CoachChat
          student={student}
          initialMessages={[{ role: 'coach', content: greeting }]}
        />
      </Card>
    </div>
  )
}
