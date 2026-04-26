# ♟️ AI Chess Trainer

An adaptive chess training app for kids and beginners, powered by Claude AI, Stockfish, and Supabase. Students play games, get personalised coaching feedback, solve puzzles, follow daily training plans, and review tournament games — all from a mobile-friendly web app.

**Live demo:** [ai-chess-trainer.netlify.app](https://ai-chess-trainer.netlify.app) *(no login required)*

---

## Features

| Feature | Description |
|---|---|
| **Adaptive AI opponent** | Stockfish difficulty auto-set from skill profile (Level 1–10), adjustable per game |
| **Post-game coaching** | Claude AI analyses every game and gives age-appropriate feedback |
| **Skill tracking** | 10+ chess skills tracked across games and puzzles (forks, pins, king safety…) |
| **Daily training plan** | Auto-generated plan targeting your weakest skills each day |
| **Puzzles** | Themed puzzles matched to your current weakness |
| **Lessons** | Step-by-step lessons with interactive board demos |
| **Tournament review** | Upload a handwritten scoresheet → extract moves → board replay → AI coaching |
| **Coach chat** | Ask the AI coach anything about your game |
| **Game clock** | 5 / 10 / 15 / 20 / 30 / 45 min time controls |
| **Check highlighting** | King square turns red when in check |
| **Demo mode** | Full UI explorable without an account |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 14](https://nextjs.org) — App Router, server components, API routes |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Auth & DB | [Supabase](https://supabase.com) — Postgres, Row Level Security, Auth |
| AI Coach | [Anthropic Claude](https://anthropic.com) (`claude-opus-4-7`) |
| Chess Engine | [Stockfish 16](https://stockfishchess.org) — WASM, runs in browser |
| Chess Logic | [chess.js](https://github.com/jhlywa/chess.js) |
| Chess Board | [react-chessboard](https://github.com/Clariity/react-chessboard) |
| State | [Zustand](https://github.com/pmndrs/zustand) |
| Data fetching | [TanStack Query](https://tanstack.com/query) |
| Deployment | [Netlify](https://netlify.com) + `@netlify/plugin-nextjs` |

---

## Architecture

```
src/
├── app/
│   ├── (app)/               # Protected routes (auth required in production)
│   │   ├── dashboard/       # Home — skill overview, daily plan
│   │   ├── play/            # Game setup + live chess board
│   │   ├── analysis/[id]/   # Post-game review — stars, feedback, move list
│   │   ├── puzzles/         # Puzzle trainer
│   │   ├── lessons/         # Lesson player
│   │   ├── progress/        # Skill charts and history
│   │   ├── coach/           # AI coach chat
│   │   └── tournament-review/ # Scoresheet upload + OCR + board replay
│   ├── (auth)/              # Login, signup, reset-password
│   └── api/                 # API routes
│       ├── games/           # Save game records
│       ├── analysis/        # Run post-game analysis
│       ├── skills/          # Skill score updates
│       ├── training/        # Daily plan generation
│       ├── puzzles/         # Puzzle fetch + attempt tracking
│       ├── lessons/         # Lesson content
│       ├── coach/           # AI chat endpoint
│       └── tournament/      # Scoresheet extraction
├── components/
│   ├── chess/               # ChessBoard, GameClock, MoveHistory, GameControls
│   ├── tournament/          # GameUpload, MoveEditor, GamePreviewBoard, ExtractionStatus
│   ├── training/            # DailyPlanCard, DailyTargetList
│   ├── rewards/             # StarSummary, RewardBadge
│   └── ui/                  # Button, Card, Badge, ProgressBar
├── hooks/                   # useChessGame, useGameClock, useProfile
├── lib/
│   ├── chess/               # engine.ts, analysis.ts, analysisEngine.ts, opponentConfig.ts
│   ├── ai/                  # coach.ts (real), coach.mock.ts, types.ts
│   ├── skills/              # tracker.ts, scoring.ts
│   ├── training/            # dailyPlan.ts, dailyPlanEvaluator.ts
│   ├── tournament/          # extractNotation.ts, validateMoves.ts, pgnBuilder.ts
│   ├── rewards/             # starSystem.ts
│   ├── adaptive/            # difficulty.ts
│   └── supabase/            # client.ts, server.ts, middleware.ts
├── stores/                  # gameStore.ts (Zustand)
└── types/                   # database.ts, chess.ts, skills.ts, tournament.ts, training.ts
```

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/vijayarjun7/ai-chess-trainer.git
cd ai-chess-trainer
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration: `supabase/migrations/001_initial_schema.sql`
3. Run any additional migrations in `supabase/`

### 3. Environment variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Anthropic — AI coaching (optional, uses mock if not set)
ANTHROPIC_API_KEY=sk-ant-...

# Feature flags
NEXT_PUBLIC_USE_MOCK_AI=true       # set false to use real Claude API
NEXT_PUBLIC_DEMO_MODE=false        # set true to skip auth entirely
```

### 4. Run locally

```bash
npm run dev
# → http://localhost:3000
```

### 5. Try demo mode

Set `NEXT_PUBLIC_DEMO_MODE=true` to explore the full UI without Supabase credentials. A mock student profile (Alex, age 10, beginner) is pre-loaded.

---

## How the App Works

### For students

1. **Sign up** — enter name, age, chess level
2. **Dashboard** — see your skill profile and today's training plan
3. **Play** — choose opponent style and time control; difficulty is auto-set from your skill level
4. **Get feedback** — after each game, Claude AI gives a coaching review with a move-by-move breakdown
5. **Train** — complete daily puzzles and lessons targeting your weakest skills
6. **Tournament** — upload a photo of your scoresheet to get AI coaching on games played offline

### Difficulty levels

| Level | Stockfish Skill | Engine Depth | Feel |
|---|---|---|---|
| 1–2 | 0–2 | 1 | Very easy — makes lots of mistakes |
| 3–4 | 4–7 | 3 | Easy — occasional blunders |
| 5–6 | 9–11 | 6 | Medium — solid but beatable |
| 7–8 | 13–16 | 10 | Hard — tactical and consistent |
| 9–10 | 18–20 | 14 | Very hard — near-master strength |

### Opponent styles

`balanced` · `aggressive` · `defensive` · `tactical` · `positional` · `endgame` · `blunder-friendly` · `coach-mode`

---

## Tournament Review

1. Go to **Tournament** tab
2. Upload a photo of your handwritten scoresheet (or type moves manually)
3. The app extracts moves and shows them in an editable list
4. Fix any misread moves — invalid moves are highlighted in red
5. Use the board preview to replay the game move by move
6. Click **Analyse** to get full AI coaching feedback

> **OCR provider:** Currently uses a mock extractor. To plug in real AI vision, implement `NotationExtractor` in `src/lib/tournament/extractNotation.ts` and swap `MockExtractor` in `createExtractor()`. The Anthropic Vision prompt is already written as `SCORESHEET_PROMPT`.

---

## Deployment

### Netlify (recommended)

1. Connect your GitHub repo to Netlify
2. The `netlify.toml` handles build settings automatically
3. Add environment variables in Netlify → Site settings → Environment variables
4. Add your Netlify URL to Supabase → Authentication → URL Configuration → Redirect URLs

### Environment variables for production

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ANTHROPIC_API_KEY=...
NEXT_PUBLIC_USE_MOCK_AI=false
NEXT_PUBLIC_DEMO_MODE=false
```

---

## Roadmap

### Near term
- [ ] Real OCR for tournament scoresheets (Anthropic Vision / Google Vision)
- [ ] Parent dashboard — view child's progress, set session limits
- [ ] Opening repertoire builder
- [ ] Puzzle streaks and daily challenges
- [ ] Voice coaching (text-to-speech feedback)

### Medium term
- [ ] Multi-player — play against friends
- [ ] PGN import — analyse any game from chess.com / Lichess
- [ ] Endgame tablebase hints
- [ ] Lesson library expansion (openings, endgames, tactics)
- [ ] Progress reports — weekly email summary for parents

### Long term
- [ ] Rating system — ELO tracked across games
- [ ] Coach mode — teacher creates accounts for multiple students
- [ ] Mobile app (React Native)
- [ ] AI-generated custom puzzles from your own games

---

## Contributing

Pull requests are welcome. For major changes, open an issue first.

```bash
npm run build   # must pass before submitting a PR
npx tsc --noEmit  # zero TypeScript errors required
```

---

## License

MIT
