-- ============================================================
-- AI Chess Trainer — Initial Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- STUDENTS
-- ============================================================
CREATE TABLE students (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name              TEXT NOT NULL,
  age               INTEGER CHECK (age >= 4 AND age <= 99),
  rating_band       TEXT NOT NULL DEFAULT 'beginner',
    -- beginner | 400-700 | 700-1000 | 1000-1300 | 1300+
  estimated_rating  INTEGER DEFAULT 400,
  skill_level       TEXT NOT NULL DEFAULT 'beginner',
    -- beginner | intermediate | advanced
  explanation_mode  TEXT NOT NULL DEFAULT 'simple',
    -- simple | intermediate | advanced
  parent_mode       BOOLEAN DEFAULT false,
  onboarding_done   BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- GAMES
-- ============================================================
CREATE TABLE games (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  pgn              TEXT,
  fen_final        TEXT,
  result           TEXT,
    -- white_wins | black_wins | draw | abandoned
  player_color     TEXT NOT NULL DEFAULT 'white',
  opponent_style   TEXT NOT NULL DEFAULT 'balanced',
    -- balanced | tactical | positional | defensive | aggressive | endgame
  ai_level         INTEGER NOT NULL DEFAULT 3 CHECK (ai_level BETWEEN 1 AND 10),
  move_count       INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- GAME ANALYSIS
-- ============================================================
CREATE TABLE game_analysis (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id          UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  student_id       UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  mistakes         JSONB DEFAULT '[]',
    -- [{move_number, fen, move_san, type: blunder|mistake|inaccuracy, description}]
  blunders         JSONB DEFAULT '[]',
  missed_tactics   JSONB DEFAULT '[]',
  coaching_summary TEXT,
  skill_tags       TEXT[] DEFAULT '{}',
    -- hanging_piece | fork | pin | skewer | checkmate | king_safety | development | ...
  overall_accuracy NUMERIC(5,2),
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SKILLS
-- ============================================================
CREATE TABLE skills (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  skill_name     TEXT NOT NULL,
    -- hanging_pieces | forks | pins | skewers | checkmate_patterns
    -- king_safety | development | pawn_structure | endgame_basics
    -- threat_awareness | tactics_combo
  category       TEXT NOT NULL,
    -- tactics | strategy | endgame | opening | awareness
  score          NUMERIC(5,2) NOT NULL DEFAULT 50.0 CHECK (score BETWEEN 0 AND 100),
  mastery_level  TEXT NOT NULL DEFAULT 'learning',
    -- learning | developing | proficient | mastered
  games_sampled  INTEGER DEFAULT 0,
  puzzles_solved INTEGER DEFAULT 0,
  last_updated   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, skill_name)
);

-- ============================================================
-- SKILL EVENTS  (audit trail for every score change)
-- ============================================================
CREATE TABLE skill_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  skill_name  TEXT NOT NULL,
  event_type  TEXT NOT NULL,
    -- game_analysis | puzzle_correct | puzzle_incorrect | lesson_complete
  delta       NUMERIC(5,2) NOT NULL,
  source_id   UUID,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- PUZZLES
-- ============================================================
CREATE TABLE puzzles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fen             TEXT NOT NULL,
  solution_moves  TEXT[] NOT NULL,  -- UCI format e.g. ['e2e4', 'd7d5']
  theme           TEXT NOT NULL,    -- matches skill_name values
  difficulty      INTEGER NOT NULL DEFAULT 3 CHECK (difficulty BETWEEN 1 AND 10),
  rating          INTEGER,
  hint            TEXT,
  explanation     TEXT,
  min_age         INTEGER DEFAULT 6,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- PUZZLE ATTEMPTS
-- ============================================================
CREATE TABLE puzzle_attempts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  puzzle_id           UUID NOT NULL REFERENCES puzzles(id),
  correct             BOOLEAN NOT NULL,
  time_taken_seconds  INTEGER,
  moves_tried         TEXT[] DEFAULT '{}',
  hint_used           BOOLEAN DEFAULT false,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- LESSONS
-- ============================================================
CREATE TABLE lessons (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  theme        TEXT NOT NULL,       -- matches skill_name
  skill_name   TEXT NOT NULL,
  difficulty   INTEGER DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  content      JSONB NOT NULL,
    -- {type: 'text'|'board'|'quiz', body: '...', fen?: '...', quiz?: {...}}
  min_age      INTEGER DEFAULT 6,
  max_age      INTEGER DEFAULT 99,
  order_index  INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- LESSON PROGRESS
-- ============================================================
CREATE TABLE lesson_progress (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  lesson_id    UUID NOT NULL REFERENCES lessons(id),
  completed    BOOLEAN DEFAULT false,
  score        NUMERIC(5,2),
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, lesson_id)
);

-- ============================================================
-- COACH INTERACTIONS
-- ============================================================
CREATE TABLE coach_interactions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  game_id    UUID REFERENCES games(id),
  role       TEXT NOT NULL CHECK (role IN ('user', 'coach')),
  content    TEXT NOT NULL,
  context    JSONB DEFAULT '{}',
    -- {skill_tags, current_focus, rating_band, explanation_mode}
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_games_student        ON games(student_id, created_at DESC);
CREATE INDEX idx_game_analysis_game   ON game_analysis(game_id);
CREATE INDEX idx_skills_student       ON skills(student_id);
CREATE INDEX idx_skill_events_student ON skill_events(student_id, created_at DESC);
CREATE INDEX idx_puzzle_attempts_stu  ON puzzle_attempts(student_id, created_at DESC);
CREATE INDEX idx_puzzles_theme_diff   ON puzzles(theme, difficulty);
CREATE INDEX idx_lesson_progress_stu  ON lesson_progress(student_id);
CREATE INDEX idx_coach_student        ON coach_interactions(student_id, created_at DESC);

-- ============================================================
-- ROW-LEVEL SECURITY
-- ============================================================
ALTER TABLE students          ENABLE ROW LEVEL SECURITY;
ALTER TABLE games             ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_analysis     ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills            ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_events      ENABLE ROW LEVEL SECURITY;
ALTER TABLE puzzle_attempts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress   ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_interactions ENABLE ROW LEVEL SECURITY;

-- Students can only see their own data
CREATE POLICY "students: own row" ON students
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "games: own" ON games
  FOR ALL USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );

CREATE POLICY "game_analysis: own" ON game_analysis
  FOR ALL USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );

CREATE POLICY "skills: own" ON skills
  FOR ALL USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );

CREATE POLICY "skill_events: own" ON skill_events
  FOR ALL USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );

CREATE POLICY "puzzle_attempts: own" ON puzzle_attempts
  FOR ALL USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );

CREATE POLICY "lesson_progress: own" ON lesson_progress
  FOR ALL USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );

CREATE POLICY "coach_interactions: own" ON coach_interactions
  FOR ALL USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );

-- Puzzles and lessons are readable by everyone authenticated
ALTER TABLE puzzles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "puzzles: read all" ON puzzles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "lessons: read all" ON lessons FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
