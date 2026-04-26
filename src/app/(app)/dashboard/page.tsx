import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getStudentSkills } from '@/lib/skills/tracker'
import { Card, CardTitle, CardDescription } from '@/components/ui/Card'
import { SkillList } from '@/components/dashboard/SkillList'
import { Button } from '@/components/ui/Button'
import { DailyPlanCard } from '@/components/training/DailyPlanCard'
import { isDemoMode, DEMO_STUDENT, DEMO_SKILLS } from '@/lib/demo/data'
import type { Skill } from '@/types/database'

export default async function DashboardPage() {
  // ── Demo mode: skip Supabase entirely ──────────────────────────────────
  if (isDemoMode()) {
    return <DashboardUI student={DEMO_STUDENT} skills={DEMO_SKILLS} recentGames={[]} />
  }

  // ── Authenticated path ─────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: student } = await supabase
    .from('students')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!student) redirect('/onboarding')
  if (!student.onboarding_done) redirect('/onboarding')

  const skills = await getStudentSkills(supabase, student.id)

  const { data: recentGames } = await supabase
    .from('games')
    .select('id, result, created_at, move_count')
    .eq('student_id', student.id)
    .order('created_at', { ascending: false })
    .limit(3)

  return <DashboardUI student={student} skills={skills} recentGames={recentGames ?? []} />
}

// ── Shared render ─────────────────────────────────────────────────────────

function DashboardUI({
  student,
  skills,
  recentGames,
}: {
  student:     { name: string; age: number | null; rating_band: string; skill_level: string }
  skills:      Skill[]
  recentGames: { id: string; result: string | null; created_at: string; move_count: number }[]
}) {
  const greeting = student.age && student.age <= 10
    ? `Hi ${student.name}! Ready to play? 👋`
    : `Welcome back, ${student.name}`

  return (
    <div className="page-container pb-20 sm:pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="section-title">{greeting}</h1>
        <p className="text-gray-500 text-sm">{student.rating_band} · {student.skill_level}</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { href: '/play',     label: 'Play a Game', icon: '♟️', color: 'bg-brand-600 text-white' },
          { href: '/puzzles',  label: 'Puzzles',     icon: '🧩', color: 'bg-emerald-600 text-white' },
          { href: '/lessons',  label: 'Lessons',     icon: '📖', color: 'bg-amber-500 text-white' },
          { href: '/coach',    label: 'Ask Coach',   icon: '💬', color: 'bg-violet-600 text-white' },
        ].map(a => (
          <Link key={a.href} href={a.href}>
            <div className={`${a.color} rounded-2xl p-4 text-center hover:opacity-90 transition-opacity cursor-pointer`}>
              <div className="text-3xl mb-1">{a.icon}</div>
              <p className="text-sm font-semibold">{a.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Daily Training Plan (full width, above the fold) ─────────────── */}
      <div className="mb-6">
        <DailyPlanCard age={student.age} />
      </div>

      {/* ── Lower grid ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skill overview */}
        <Card>
          <CardTitle>Your Skills</CardTitle>
          <CardDescription>Weakest areas shown first</CardDescription>
          <div className="mt-4">
            {skills.length > 0
              ? <SkillList skills={skills} maxItems={5} showWeak />
              : <p className="text-gray-400 text-sm">Play a game to start tracking!</p>
            }
            <div className="mt-4">
              <Link href="/progress">
                <Button variant="ghost" size="sm" className="w-full">View all skills →</Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Recent games */}
        {recentGames.length > 0 && (
          <Card>
            <CardTitle>Recent Games</CardTitle>
            <CardDescription>Your last {recentGames.length} games</CardDescription>
            <div className="mt-4 space-y-2">
              {recentGames.map(game => (
                <Link key={game.id} href={`/analysis/${game.id}`}>
                  <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {game.result?.replace('_', ' ') ?? 'Game'}
                      </p>
                      <p className="text-xs text-gray-400">{game.move_count} moves</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(game.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
