export type ValidationStatus = 'pending' | 'valid' | 'invalid'
export type GameResultPgn   = '1-0' | '0-1' | '1/2-1/2' | '*'

export interface ExtractionResult {
  moves:      string[]
  rawText:    string
  confidence: number      // 0–1
  warnings:   string[]
}

export interface ValidationResult {
  valid:            boolean
  invalidAtIndex:   number | null
  errorMessage:     string | null
  validUpToIndex:   number          // exclusive — how many moves are confirmed valid
}

export interface TournamentGameUpload {
  id:               string
  studentId:        string
  imageUrl?:        string
  rawExtractedText?: string
  extractedMoves:   string[]
  correctedMoves:   string[]
  pgn?:             string
  validationStatus: ValidationStatus
  analysisGameId?:  string
  createdAt:        string
}
