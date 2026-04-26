import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStudentSkills } from '@/lib/skills/tracker'
import { getPrimaryFocusSkill, adaptivePuzzleDifficulty } from '@/lib/skills/recommendations'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const theme = searchParams.get('theme')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: student } = await supabase
    .from('students')
    .select('id, age, rating_band')
    .eq('user_id', user.id)
    .single()

  if (!student) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const skills      = await getStudentSkills(supabase, student.id)
  const focusSkill  = theme ?? getPrimaryFocusSkill(skills)
  const focusScore  = skills.find(s => s.skill_name === focusSkill)?.score ?? 50
  const targetDiff  = adaptivePuzzleDifficulty(focusScore, student.rating_band)

  let query = supabase
    .from('puzzles')
    .select('*')
    .gte('difficulty', Math.max(1, targetDiff - 1))
    .lte('difficulty', Math.min(10, targetDiff + 1))
    .lte('min_age', student.age ?? 99)

  if (focusSkill) query = query.eq('theme', focusSkill)

  const { data: puzzles } = await query.limit(10)

  // If no puzzles found for the theme, fall back to any puzzle at this difficulty
  if (!puzzles || puzzles.length === 0) {
    const { data: fallback } = await supabase
      .from('puzzles')
      .select('*')
      .gte('difficulty', Math.max(1, targetDiff - 2))
      .lte('difficulty', Math.min(10, targetDiff + 2))
      .limit(5)

    return NextResponse.json({ puzzles: fallback ?? [], focusSkill, targetDifficulty: targetDiff })
  }

  return NextResponse.json({ puzzles, focusSkill, targetDifficulty: targetDiff })
}
