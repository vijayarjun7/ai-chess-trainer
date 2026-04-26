import { NextRequest, NextResponse } from 'next/server'
import { createExtractor } from '@/lib/tournament/extractNotation'

// No auth required — extraction is stateless (no DB write).
// The subsequent game save step requires auth.
export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json()
    const extractor = createExtractor()
    const result    = await extractor.extract(imageBase64 ?? '')
    return NextResponse.json(result)
  } catch (err) {
    console.error('extraction error', err)
    return NextResponse.json({ error: 'Extraction failed' }, { status: 500 })
  }
}
