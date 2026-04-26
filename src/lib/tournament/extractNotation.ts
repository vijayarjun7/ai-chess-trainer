import type { ExtractionResult } from '@/types/tournament'

// ── Provider interface ────────────────────────────────────────────────────────
// To plug in a real OCR/vision provider:
//   1. Implement NotationExtractor
//   2. Replace MockExtractor with your class in createExtractor()
//
// Example with Anthropic Vision (server-side only):
//   const client = new Anthropic()
//   const response = await client.messages.create({
//     model: 'claude-opus-4-7',
//     max_tokens: 1024,
//     messages: [{
//       role: 'user',
//       content: [
//         { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 } },
//         { type: 'text', text: SCORESHEET_PROMPT },
//       ],
//     }],
//   })

export const SCORESHEET_PROMPT = `
You are reading a handwritten chess scoresheet.
Extract every move in Standard Algebraic Notation (SAN).
Return ONLY a JSON object:
{ "moves": ["e4", "e5", ...], "confidence": 0.92, "warnings": ["Move 7 unclear"] }
Do not include move numbers. Castling is O-O or O-O-O.
`.trim()

export interface NotationExtractor {
  extract(imageBase64: string): Promise<ExtractionResult>
}

// ── Mock extractor ────────────────────────────────────────────────────────────
// Returns a sample Ruy Lopez opening so the full UI is testable without a real OCR provider.

class MockExtractor implements NotationExtractor {
  async extract(_imageBase64: string): Promise<ExtractionResult> {
    await new Promise(r => setTimeout(r, 1400))   // simulate network latency
    return {
      moves: [
        'e4', 'e5',
        'Nf3', 'Nc6',
        'Bb5', 'a6',
        'Ba4', 'Nf6',
        'O-O', 'Be7',
        'Re1', 'b5',
        'Bb3', 'd6',
      ],
      rawText:    '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. 0-0 Be7 6. Re1 b5 7. Bb3 d6',
      confidence: 0.84,
      warnings:   ['Move 5 white: "0-0" normalised to "O-O"'],
    }
  }
}

export function createExtractor(): NotationExtractor {
  return new MockExtractor()
}

// ── Manual paste parser ───────────────────────────────────────────────────────
// Accepts freeform text: move numbers, result tokens, comments, NAGs are all stripped.

export function parseManualInput(text: string): string[] {
  return text
    .replace(/\{[^}]*\}/g, '')             // { comments }
    .replace(/\([^)]*\)/g, '')             // (variations)
    .replace(/\$\d+/g, '')                 // $NAG
    .replace(/1-0|0-1|1\/2-1\/2|\*/g, '') // result markers
    .replace(/\d+\s*\.{1,3}\s*/g, '')     // move numbers: "1." "12..." "1. "
    .trim()
    .split(/\s+/)
    .map(t => t.trim())
    .filter(Boolean)
}
