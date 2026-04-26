import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const theme = searchParams.get('theme')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: student } = await supabase
    .from('students')
    .select('id, age')
    .eq('user_id', user.id)
    .single()

  let query = supabase
    .from('lessons')
    .select('*')
    .order('order_index')

  if (theme) query = query.eq('theme', theme)

  const { data: lessons } = await query.limit(20)

  // Fetch completion status
  let completedIds: string[] = []
  if (student) {
    const { data: progress } = await supabase
      .from('lesson_progress')
      .select('lesson_id')
      .eq('student_id', student.id)
      .eq('completed', true)

    completedIds = (progress ?? []).map(p => p.lesson_id)
  }

  return NextResponse.json({ lessons: lessons ?? [], completedIds })
}

const CompleteSchema = z.object({ lesson_id: z.string().uuid() })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = CompleteSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!student) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const { data: progress } = await supabase
    .from('lesson_progress')
    .upsert(
      {
        student_id:   student.id,
        lesson_id:    parsed.data.lesson_id,
        completed:    true,
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'student_id,lesson_id' }
    )
    .select()
    .single()

  // Log a skill event for the lesson
  const { data: lesson } = await supabase
    .from('lessons')
    .select('skill_name')
    .eq('id', parsed.data.lesson_id)
    .single()

  if (lesson) {
    await supabase.from('skill_events').insert({
      student_id: student.id,
      skill_name: lesson.skill_name,
      event_type: 'lesson_complete',
      delta:      3,
      source_id:  parsed.data.lesson_id,
    })
  }

  return NextResponse.json({ progress })
}
