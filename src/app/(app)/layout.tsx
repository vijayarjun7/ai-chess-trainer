import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isDemoMode } from '@/lib/demo/data'

const NAV = [
  { href: '/dashboard', label: 'Home',     icon: '🏠' },
  { href: '/play',      label: 'Play',     icon: '♟️' },
  { href: '/puzzles',   label: 'Puzzles',  icon: '🧩' },
  { href: '/lessons',   label: 'Lessons',  icon: '📖' },
  { href: '/progress',  label: 'Progress', icon: '📊' },
  { href: '/coach',     label: 'Coach',    icon: '💬' },
]

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!isDemoMode()) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="font-extrabold text-brand-700 text-lg">
            ♟️ ChessCoach
          </Link>
          {isDemoMode() && (
            <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
              Demo mode
            </span>
          )}
          <nav className="hidden sm:flex items-center gap-1">
            {NAV.map(n => (
              <Link
                key={n.href}
                href={n.href}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-brand-700 hover:bg-brand-50 transition-colors"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="sm:hidden bg-white border-t border-gray-100 fixed bottom-0 left-0 right-0 safe-area-bottom">
        <div className="grid grid-cols-6 h-16">
          {NAV.map(n => (
            <Link
              key={n.href}
              href={n.href}
              className="flex flex-col items-center justify-center gap-0.5 text-gray-500 hover:text-brand-600 active:text-brand-700 transition-colors"
            >
              <span className="text-xl leading-none">{n.icon}</span>
              <span className="text-[10px] font-medium leading-none mt-0.5 truncate w-full text-center px-0.5">
                {n.label}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
