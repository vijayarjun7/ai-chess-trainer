'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Card, CardTitle } from '@/components/ui/Card'

type View = 'login' | 'forgot' | 'forgot-sent'

export default function LoginPage() {
  const router = useRouter()
  const [view, setView]         = useState<View>('login')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setLoading(false)
    if (error) { setError(error.message); return }
    setView('forgot-sent')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">♟️</div>
          <CardTitle>
            {view === 'login' ? 'Welcome back' : view === 'forgot' ? 'Reset password' : 'Check your email'}
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            {view === 'login'       && 'Log in to continue your training'}
            {view === 'forgot'      && 'Enter your email and we\'ll send a reset link'}
            {view === 'forgot-sent' && `We sent a reset link to ${email}`}
          </p>
        </div>

        {/* ── Login form ── */}
        {view === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <button
                  type="button"
                  onClick={() => { setError(null); setView('forgot') }}
                  className="text-xs text-brand-600 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <Button type="submit" className="w-full" loading={loading}>
              Log In
            </Button>
          </form>
        )}

        {/* ── Forgot password form ── */}
        {view === 'forgot' && (
          <form onSubmit={handleForgot} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <Button type="submit" className="w-full" loading={loading}>
              Send Reset Link
            </Button>
            <button
              type="button"
              onClick={() => { setError(null); setView('login') }}
              className="w-full text-sm text-gray-500 hover:text-gray-700 text-center"
            >
              ← Back to login
            </button>
          </form>
        )}

        {/* ── Email sent confirmation ── */}
        {view === 'forgot-sent' && (
          <div className="space-y-4 text-center">
            <div className="text-5xl">📬</div>
            <p className="text-sm text-gray-600">
              Open the link in the email to set a new password. Check your spam folder if you don't see it.
            </p>
            <Button variant="secondary" className="w-full" onClick={() => { setError(null); setView('login') }}>
              Back to login
            </Button>
          </div>
        )}

        {view === 'login' && (
          <p className="text-center text-sm text-gray-500 mt-4">
            No account?{' '}
            <Link href="/signup" className="text-brand-600 font-medium hover:underline">
              Sign up
            </Link>
          </p>
        )}
      </Card>
    </div>
  )
}
