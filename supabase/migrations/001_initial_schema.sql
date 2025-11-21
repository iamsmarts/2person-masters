-- QGC Masters Draw App - Initial Schema
-- Run this in Supabase SQL Editor

-- =============================================================================
-- TABLES
-- =============================================================================

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('T1', 'T2A', 'T2B', 'T3')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_number INTEGER NOT NULL CHECK (team_number >= 1 AND team_number <= 10),
  left_player_id UUID REFERENCES players(id),
  right_player_id UUID REFERENCES players(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(team_number)
);

-- Tee times table
CREATE TABLE IF NOT EXISTS tee_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  slot_index INTEGER NOT NULL CHECK (slot_index >= 1 AND slot_index <= 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(slot_index)
);

-- Tee assignments table
CREATE TABLE IF NOT EXISTS tee_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tee_time_id UUID NOT NULL REFERENCES tee_times(id),
  team_id UUID NOT NULL REFERENCES teams(id),
  slot_in_foursome INTEGER NOT NULL CHECK (slot_in_foursome IN (1, 2)),
  reveal_order INTEGER NOT NULL CHECK (reveal_order >= 1 AND reveal_order <= 10),
  revealed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(team_id)
);

-- Draw state table (singleton)
CREATE TABLE IF NOT EXISTS draw_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'NOT_STARTED' CHECK (status IN (
    'NOT_STARTED',
    'PAIRING_T1_T3',
    'PAIRING_T2_TIERS',
    'PAIRINGS_DONE',
    'TEE_TIMES_READY',
    'TEE_TIMES_DONE'
  )),
  current_team_number INTEGER CHECK (current_team_number IS NULL OR (current_team_number >= 1 AND current_team_number <= 10)),
  currently_filling_side TEXT CHECK (currently_filling_side IS NULL OR currently_filling_side IN ('left', 'right')),
  current_tee_reveal_index INTEGER CHECK (current_tee_reveal_index IS NULL OR (current_tee_reveal_index >= 1 AND current_tee_reveal_index <= 10)),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Auto-update updated_at on draw_state
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_draw_state_updated_at
  BEFORE UPDATE ON draw_state
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- SEED DATA
-- =============================================================================

-- Seed players
INSERT INTO players (display_name, tier) VALUES
  -- Tier 1 (strongest)
  ('Adam', 'T1'),
  ('Alonso', 'T1'),
  -- Tier 3 (weakest)
  ('Jeffery', 'T3'),
  ('Kevin', 'T3'),
  -- Tier 2 Group A
  ('Cisco', 'T2A'),
  ('Will', 'T2A'),
  ('Manny', 'T2A'),
  ('Rudy', 'T2A'),
  ('Jessy', 'T2A'),
  ('Ericka', 'T2A'),
  ('Jaime', 'T2A'),
  ('Memo', 'T2A'),
  -- Tier 2 Group B
  ('Richie', 'T2B'),
  ('Che', 'T2B'),
  ('Jose', 'T2B'),
  ('Xilos', 'T2B'),
  ('Herb', 'T2B'),
  ('Jorge', 'T2B'),
  ('Dereck', 'T2B'),
  ('Tony', 'T2B');

-- Seed tee times
INSERT INTO tee_times (label, slot_index) VALUES
  ('7:00 AM', 1),
  ('7:08 AM', 2),
  ('7:16 AM', 3),
  ('7:24 AM', 4),
  ('7:32 AM', 5);

-- Initialize draw state (single row)
INSERT INTO draw_state (status) VALUES ('NOT_STARTED');

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE tee_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE tee_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_state ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all tables
CREATE POLICY "Allow public read access" ON players FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON teams FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON tee_times FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON tee_assignments FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON draw_state FOR SELECT USING (true);

-- Allow public write access (for simplicity in this app)
-- In production, you'd want to restrict this to authenticated users
CREATE POLICY "Allow public insert" ON teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON teams FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON teams FOR DELETE USING (true);

CREATE POLICY "Allow public insert" ON tee_assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON tee_assignments FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON tee_assignments FOR DELETE USING (true);

CREATE POLICY "Allow public update" ON draw_state FOR UPDATE USING (true);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX idx_players_tier ON players(tier);
CREATE INDEX idx_teams_team_number ON teams(team_number);
CREATE INDEX idx_tee_times_slot_index ON tee_times(slot_index);
CREATE INDEX idx_tee_assignments_reveal_order ON tee_assignments(reveal_order);
