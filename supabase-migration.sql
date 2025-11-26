-- ViralVein Migration Script
-- Run this if you already have an existing database with the old schema
-- This will add scrape sessions support to your existing setup

-- Step 1: Create the scrape_sessions table
CREATE TABLE IF NOT EXISTS scrape_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  video_count INTEGER DEFAULT 0,
  hashtags_scraped TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scrape_sessions_created_at ON scrape_sessions(created_at DESC);

-- Step 2: Create a default "Legacy Scrape" session for existing videos
INSERT INTO scrape_sessions (name, description, video_count, hashtags_scraped, created_at)
VALUES (
  'Legacy Scrape',
  'Videos from before session tracking was implemented',
  (SELECT COUNT(*) FROM videos),
  ARRAY[]::TEXT[],
  NOW()
)
ON CONFLICT DO NOTHING
RETURNING id;

-- Step 3: Add scrape_session_id column to videos table
ALTER TABLE videos
ADD COLUMN IF NOT EXISTS scrape_session_id UUID REFERENCES scrape_sessions(id) ON DELETE CASCADE;

-- Step 4: Link all existing videos to the legacy session
UPDATE videos
SET scrape_session_id = (SELECT id FROM scrape_sessions WHERE name = 'Legacy Scrape' LIMIT 1)
WHERE scrape_session_id IS NULL;

-- Step 5: Drop the old UNIQUE constraint on platform_id
ALTER TABLE videos DROP CONSTRAINT IF EXISTS videos_platform_id_key;

-- Step 6: Add new composite UNIQUE constraint
ALTER TABLE videos
ADD CONSTRAINT videos_platform_id_session_unique
UNIQUE(platform_id, scrape_session_id);

-- Step 7: Create index for faster session queries
CREATE INDEX IF NOT EXISTS idx_videos_scrape_session_id ON videos(scrape_session_id);

-- Add comments
COMMENT ON TABLE scrape_sessions IS 'Individual scraping sessions with metadata';
COMMENT ON COLUMN videos.scrape_session_id IS 'Links video to its scraping session';
COMMENT ON COLUMN scrape_sessions.hashtags_scraped IS 'Array of hashtag keywords included in this scrape';
