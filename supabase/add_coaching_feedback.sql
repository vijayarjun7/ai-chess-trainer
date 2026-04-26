-- Run this in Supabase SQL editor

-- 1. Add coaching_feedback column
ALTER TABLE game_analysis
  ADD COLUMN IF NOT EXISTS coaching_feedback JSONB DEFAULT NULL;

-- 2. Remove duplicate game_analysis rows (keep newest per game_id), then add unique constraint
DELETE FROM game_analysis
WHERE id NOT IN (
  SELECT DISTINCT ON (game_id) id
  FROM game_analysis
  ORDER BY game_id, created_at DESC
);

ALTER TABLE game_analysis
  ADD CONSTRAINT game_analysis_game_id_unique UNIQUE (game_id);
