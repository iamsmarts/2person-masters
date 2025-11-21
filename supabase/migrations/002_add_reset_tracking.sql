-- Add reset tracking to draw_state
-- Run this in Supabase SQL Editor after the initial migration

-- Add new columns for tracking paid resets
ALTER TABLE draw_state
ADD COLUMN IF NOT EXISTS resets_used INTEGER DEFAULT 0 CHECK (resets_used >= 0 AND resets_used <= 3),
ADD COLUMN IF NOT EXISTS reset_amounts JSONB DEFAULT '[]'::jsonb;

-- Update existing row to have default values
UPDATE draw_state SET
  resets_used = 0,
  reset_amounts = '[]'::jsonb
WHERE resets_used IS NULL;
