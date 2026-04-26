'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChessBoard } from '@/components/chess/ChessBoard'
import { MoveHistory } from '@/components/chess/MoveHistory'
import { GameControls } from '@/components/chess/GameControls'
import { GameClock, ClockFace } from '@/components/chess/GameClock'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useChessGame } from '@/hooks/useChessGame'
import { useGameClock } from '@/hooks/useGameClock'
import { useProfile } from '@/hooks/useProfile'
import { getOpponentConfig, defaultOpponentConfig } from '@/lib/chess/opponentConfig'
import { OPPONENT_PERSONALITIES } from '@/types/chess'
import type { OpponentStyle, PlayerColor } from '@/types/database'
import type { SkillName } from '@/types/skills'

const TIME_CONTROLS = [5, 10, 15, 20, 30, 45] as const

type SetupState = 'config' | 'playing'

export default function PlayPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const { student }  = useProfile()
  const game         = useChessGame()

  const [phase, setPhase]           = useState<SetupState>('config')
  const [playerColor, setColor]     = useState<PlayerColor>('white')
  const [opponentStyle, setStyle]   = useState<OpponentStyle>('balanced')
  const [aiLevel, setAiLevel]       = useState(3)
  const [, setSaving]               = useState(false)
  const [timeControl, setTimeCtrl]  = useState<number | null>(10)

  // Honour ?focus=<skill> link from DailyPlanCard
  const focusSkill = (searchParams.get('focus') ?? null) as SkillName | null

  const handleStartGame = () => {
    let level = aiLevel

    const opponentConfig = student
      ? (() => {
          level = student.estimated_rating >= 1300 ? 9
                : student.estimated_rating >= 1000 ? 7
                : student.estimated_rating >= 700  ? 5
                : student.estimated_rating >= 400  ? 3
                : 2
          return getOpponentConfig(
            {
              ratingBand:       student.rating_band,
              estimatedRating:  student.estimated_rating,
              avgSkillScore:    50,         // updated once skills are fetched
              recentWeaknesses: [],
            },
            opponentStyle,
            focusSkill,
          )
        })()
      : defaultOpponentConfig(aiLevel, opponentStyle)

    setAiLevel(level)
    game.startGame({ playerColor, aiLevel: level, opponentStyle, opponentConfig, timeControlMinutes: timeControl })
    setPhase('playing')
  }

  const handleTimeout = useCallback((loser: 'white' | 'black') => {
    const result = loser === 'white' ? 'black_wins' : 'white_wins'
    saveGame(result)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const savedRef = useRef(false)

  const saveGame = useCallback(async (overrideResult?: string) => {
    if (savedRef.current) return
    savedRef.current = true
    setSaving(true)
    try {
      const res = await fetch('/api/games', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pgn:              game.pgn,
          player_color:     playerColor,
          opponent_style:   opponentStyle,
          ai_level:         aiLevel,
          duration_seconds: game.startedAt
            ? Math.round((Date.now() - game.startedAt) / 1000)
            : null,
          result: overrideResult,
        }),
      })
      const { game: saved } = await res.json()
      if (saved?.id) router.push(`/analysis/${saved.id}`)
      else setPhase('config')
    } finally {
      setSaving(false)
    }
  }, [game.pgn, game.startedAt, playerColor, opponentStyle, aiLevel, router])

  const handleResign = useCallback(() => {
    if (phase !== 'playing') return
    // No moves yet — just return to config
    if (!game.pgn) { game.resetGame(); setPhase('config'); return }
    saveGame('abandoned')
  }, [phase, game, saveGame])

  // Auto-save when game ends naturally (checkmate / stalemate / draw)
  useEffect(() => {
    if (game.gameOver && phase === 'playing') saveGame()
  }, [game.gameOver]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset savedRef when a new game starts
  useEffect(() => {
    savedRef.current = false
  }, [game.config])

  // Derive whose turn it is (white = even ply)
  const isWhiteTurn = game.isPlayerTurn
    ? playerColor === 'white'
    : playerColor !== 'white'

  const clock = useGameClock(
    timeControl ? timeControl * 60 : null,
    isWhiteTurn,
    game.gameOver,
    handleTimeout,
  )

  const opponentColor: PlayerColor = playerColor === 'white' ? 'black' : 'white'
  const opponentTime  = playerColor === 'white' ? clock.black : clock.white
  const playerTime    = playerColor === 'white' ? clock.white : clock.black

  return (
    <div className="page-container pb-20 sm:pb-8">
      {phase === 'config' && (
        <div className="max-w-lg mx-auto">
          <h1 className="section-title">New Game</h1>
          <p className="section-sub">Choose your settings</p>

          <Card className="space-y-6">
            {/* Color */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Play as</label>
              <div className="flex gap-3">
                {(['white', 'black'] as PlayerColor[]).map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`flex-1 py-3 rounded-xl border text-sm font-medium capitalize transition-colors ${
                      playerColor === c
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {c === 'white' ? '♙ White' : '♟ Black'}
                  </button>
                ))}
              </div>
            </div>

            {/* Opponent style */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Opponent style</label>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                {(Object.keys(OPPONENT_PERSONALITIES) as OpponentStyle[]).map(s => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={`px-3 py-2 rounded-xl border text-sm text-left transition-colors active:scale-95 ${
                      opponentStyle === s
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-gray-200 text-gray-700'
                    }`}
                  >
                    <span className="font-medium capitalize text-xs sm:text-sm">{s.replace('-', ' ')}</span>
                    <span className="block text-[10px] sm:text-xs text-gray-400 mt-0.5 truncate">
                      {OPPONENT_PERSONALITIES[s].tendencies[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Manual AI level when no profile */}
            {!student && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  AI difficulty: {aiLevel}
                </label>
                <input
                  type="range" min={1} max={10} value={aiLevel}
                  onChange={e => setAiLevel(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            )}

            {/* Time control */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Time control</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setTimeCtrl(null)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    timeControl === null ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  No limit
                </button>
                {TIME_CONTROLS.map(m => (
                  <button
                    key={m}
                    onClick={() => setTimeCtrl(m)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      timeControl === m ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {m} min
                  </button>
                ))}
              </div>
            </div>

            {student && (
              <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                AI difficulty is auto-set from your skill profile.
                {focusSkill && ` Training focus: ${focusSkill.replace(/_/g, ' ')}.`}
              </p>
            )}

            <Button className="w-full" size="lg" onClick={handleStartGame}>
              Start Game
            </Button>
          </Card>
        </div>
      )}

      {phase === 'playing' && (
        <>
          {/* ── Mobile layout ── */}
          <div className="lg:hidden flex flex-col gap-2">
            {/* Opponent strip */}
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
              <div className="text-sm font-medium text-gray-600">
                🤖 {opponentStyle.replace('-', ' ')} · Lv {aiLevel}
              </div>
              {timeControl && (
                <ClockFace
                  label="Opponent"
                  time={opponentTime}
                  active={!isWhiteTurn && !game.gameOver}
                  compact
                />
              )}
              {!timeControl && (
                <span className="text-xs text-gray-400">
                  {game.isPlayerTurn ? '' : '🤔 thinking…'}
                </span>
              )}
            </div>

            {/* Board */}
            <ChessBoard
              fen={game.fen}
              playerColor={playerColor}
              onMove={(from, to) => game.onPlayerMove(from, to)}
              disabled={!game.isPlayerTurn || game.gameOver}
            />

            {/* Player strip */}
            <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-3 py-2">
              <div className="text-sm font-semibold text-gray-900">You</div>
              {timeControl && (
                <ClockFace
                  label="You"
                  time={playerTime}
                  active={isWhiteTurn && !game.gameOver}
                  compact
                />
              )}
              {!game.gameOver ? (
                <button
                  onClick={handleResign}
                  className="text-xs text-red-500 font-medium border border-red-200 rounded-lg px-2.5 py-1 active:bg-red-50"
                >
                  Resign
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => saveGame()}
                    className="text-xs text-brand-600 font-medium border border-brand-200 rounded-lg px-2.5 py-1"
                  >
                    Analyse
                  </button>
                  <button
                    onClick={() => setPhase('config')}
                    className="text-xs text-gray-600 font-medium border border-gray-200 rounded-lg px-2.5 py-1"
                  >
                    New
                  </button>
                </div>
              )}
            </div>

            {/* Status banner */}
            {game.gameOver && (
              <div className="bg-brand-50 border border-brand-100 rounded-xl px-4 py-2 text-center">
                <p className="font-bold text-brand-800">
                  {game.result === 'white_wins' ? 'White wins!'
                    : game.result === 'black_wins' ? 'Black wins!'
                    : game.result === 'draw' ? 'Draw!'
                    : 'Game over'}
                </p>
              </div>
            )}

            {/* Last few moves */}
            {game.moveHistory.length > 0 && (
              <div className="overflow-x-auto">
                <div className="flex gap-1 text-xs font-mono text-gray-500 pb-1">
                  {game.moveHistory.slice(-12).map((m, i) => (
                    <span key={i} className="bg-gray-100 rounded px-1.5 py-0.5 whitespace-nowrap">{m}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Desktop layout ── */}
          <div className="hidden lg:flex flex-row gap-6">
            <div className="flex-1">
              <ChessBoard
                fen={game.fen}
                playerColor={playerColor}
                onMove={(from, to) => game.onPlayerMove(from, to)}
                disabled={!game.isPlayerTurn || game.gameOver}
              />
            </div>
            <div className="w-72 flex flex-col gap-4">
              {timeControl && (
                <GameClock
                  whiteTime={clock.white}
                  blackTime={clock.black}
                  isWhiteTurn={isWhiteTurn}
                  playerColor={playerColor}
                  gameOver={game.gameOver}
                />
              )}
              <GameControls
                isPlayerTurn={game.isPlayerTurn}
                gameOver={game.gameOver}
                result={game.result}
                aiLevel={aiLevel}
                opponentStyle={opponentStyle}
                onResign={handleResign}
                onNewGame={() => setPhase('config')}
                onAnalyse={() => saveGame()}
              />
              <Card padding="sm">
                <CardTitle>Moves</CardTitle>
                <div className="mt-2">
                  <MoveHistory moves={game.moveHistory} />
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
