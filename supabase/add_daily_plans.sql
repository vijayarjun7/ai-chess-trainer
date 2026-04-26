-- Daily Training Loop — daily_plans table
-- Run this in your Supabase SQL editor.

CREATE TABLE IF NOT EXISTS daily_plans (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date                DATE NOT NULL,

  -- Diagnostic game that triggered this plan
  diagnostic_game_id  UUID REFERENCES games(id) ON DELETE SET NULL,

  -- Skill diagnosis from the diagnostic game + current skill profile
  primary_weakness    TEXT,   -- SkillName
  secondary_weakness  TEXT,   -- SkillName
  strongest_skill     TEXT,   -- SkillName

  -- Up to 3 training targets stored as JSONB array of DailyTarget
  targets             JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Overall plan status
  status              TEXT NOT NULL DEFAULT 'diagnostic_needed'
                      CHECK (status IN (
                        'diagnostic_needed',
                        'in_progress',
                        'completed',
                        'repeat_needed'
                      )),

  completed_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One plan per student per day
  UNIQUE (student_id, date)
);

-- Index for fast "today's plan" lookups
CREATE INDEX IF NOT EXISTS idx_daily_plans_student_date
  ON daily_plans (student_id, date DESC);

-- Auto-update updated_at on any change
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_daily_plans_updated_at ON daily_plans;
CREATE TRIGGER trg_daily_plans_updated_at
  BEFORE UPDATE ON daily_plans
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Row-level security: students can only see their own plans
ALTER TABLE daily_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_plans: student reads own"
  ON daily_plans FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "daily_plans: student writes own"
  ON daily_plans FOR ALL
  USING (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
  );
