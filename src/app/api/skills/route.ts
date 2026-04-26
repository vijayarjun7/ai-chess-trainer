import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStudentSkills } from '@/lib/skills/tracker'
import { generateRecommendations } from '@/lib/skills/recommendations'

export async function GET(_req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: student } = await supabase
    .from('students')
    .select('id, age, rating_band')
    .eq('user_id', user.id)
    .single()

  if (!student) return NextResponse.json({ skills: [], recommendations: [] })

  const skills        = await getStudentSkills(supabase, student.id)
  const recommendations = generateRecommendations(skills, student.rating_band, student.age)

  return NextResponse.json({ skills, recommendations })
}
