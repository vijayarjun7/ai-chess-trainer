'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardTitle } from '@/components/ui/Card'

const RATING_BANDS = ['beginner', '400-700', '700-1000', '1000-1300', '1300+']

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [name, setName]         = useState('')
  const [age, setAge]           = useState('')
  const [ratingBand, setRating] = useState('beginner')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        age: age ? parseInt(age) : undefined,
        rating_band: ratingBand,
        skill_level: ratingBand === 'beginner' ? 'beginner' : ratingBand < '700-1000' ? 'intermediate' : 'advanced',
      }),
    })

    if (!res.ok) {
      setError('Could not save your profile. Please try again.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">♟️</div>
          <CardTitle>Let's set up your profile</CardTitle>
          <p className="text-sm text-gray-500 mt-1">Step {step} of 2</p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6">
          <div
            className="bg-brand-500 h-1.5 rounded-full transition-all"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Alex"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your age <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="number"
                value={age}
                onChange={e => setAge(e.target.value)}
                min={4}
                max={99}
                placeholder="e.g. 10"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <Button
              className="w-full"
              disabled={!name.trim()}
              onClick={() => setStep(2)}
            >
              Next
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What is your current chess level?
              </label>
              <div className="space-y-2">
                {RATING_BANDS.map(band => (
                  <button
                    key={band}
                    onClick={() => setRating(band)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                      ratingBand === band
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {band === 'beginner'
                      ? 'Beginner — I am just starting out'
                      : `Rating ${band}`}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button className="flex-1" loading={loading} onClick={handleSubmit}>
                Start Training
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
