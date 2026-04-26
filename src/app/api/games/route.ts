import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getMoveCount, pgnResultToDbResult } from '@/lib/chess/pgn'
import { z } from 'zod'

const SaveGameSchema = z.object({
  pgn:           z.string(),
  player_color:  z.enum(['white', 'black']).default('white'),
  opponent_style:z.string().default('balanced'),
  ai_level:      z.number().min(1).max(10).default(3),
  duration_seconds: z.number().optional(),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = SaveGameSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { pgn, player_color, opponent_style, ai_level, duration_seconds } = parsed.data

  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!student) return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })

  const { data: game, error } = await supabase
    .from('games')
    .insert({
      student_id:      student.id,
      pgn,
      result:          pgnResultToDbResult(pgn),
      player_color,
      opponent_style,
      ai_level,
      move_count:      getMoveCount(pgn),
      duration_seconds: duration_seconds ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ game })
}

export async function GET(_req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!student) return NextResponse.json({ games: [] })

  const { data: games } = await supabase
    .from('games')
    .select('*')
    .eq('student_id', student.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json({ games: games ?? [] })
}
