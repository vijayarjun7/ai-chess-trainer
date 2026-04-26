import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-xl">
        <div className="text-6xl mb-6">♟️</div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          Your Personal Chess Coach
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Play, learn, and grow — with an AI coach that adapts to you.
          Built for students aged 6 and above.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/signup">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" size="lg">Log In</Button>
          </Link>
        </div>
      </div>

      <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full">
        {[
          { icon: '🎮', title: 'Play vs AI',      desc: 'Multiple styles and difficulty levels that adapt as you improve.' },
          { icon: '🧩', title: 'Targeted Puzzles', desc: 'Puzzles chosen for your weakest skills, not just your rating.' },
          { icon: '📊', title: 'Track Progress',   desc: 'See skill-by-skill improvement over every game you play.' },
        ].map(f => (
          <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
            <p className="text-sm text-gray-500">{f.desc}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
