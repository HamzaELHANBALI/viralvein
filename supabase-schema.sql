-- ViralVein Database Schema
-- Run this in your Supabase SQL Editor to create the tables

-- Table 1: tracked_tags
-- Stores hashtags that the user wants to monitor
CREATE TABLE tracked_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('tiktok', 'instagram')),
  last_scraped TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_tracked_tags_status ON tracked_tags(status);
CREATE INDEX idx_tracked_tags_platform ON tracked_tags(platform);

-- Table 2: scrape_sessions
-- Stores metadata about each scraping session
CREATE TABLE scrape_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  video_count INTEGER DEFAULT 0,
  hashtags_scraped TEXT[], -- Array of hashtag keywords scraped in this session
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_scrape_sessions_created_at ON scrape_sessions(created_at DESC);

-- Table 3: videos
-- Stores scraped video data with viral scores
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scrape_session_id UUID REFERENCES scrape_sessions(id) ON DELETE CASCADE,
  platform_id TEXT NOT NULL, -- No longer UNIQUE to allow same video in different sessions
  url TEXT NOT NULL,
  thumbnail TEXT NOT NULL,
  description TEXT,
  view_count INTEGER NOT NULL,
  like_count INTEGER NOT NULL,
  creator_followers INTEGER NOT NULL,
  viral_score REAL NOT NULL, -- Calculated: view_count / creator_followers
  upload_date TIMESTAMPTZ NOT NULL,
  is_saved BOOLEAN DEFAULT FALSE,
  notes TEXT,
  hashtag_keyword TEXT, -- Optional: which hashtag found this video
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform_id, scrape_session_id) -- Prevent duplicate videos within the same session
);

-- Create indexes for faster queries
CREATE INDEX idx_videos_scrape_session_id ON videos(scrape_session_id);
CREATE INDEX idx_videos_viral_score ON videos(viral_score DESC);
CREATE INDEX idx_videos_is_saved ON videos(is_saved);
CREATE INDEX idx_videos_platform_id ON videos(platform_id);
CREATE INDEX idx_videos_upload_date ON videos(upload_date DESC);

-- Add comments for documentation
COMMENT ON TABLE tracked_tags IS 'Hashtags being monitored for viral content';
COMMENT ON TABLE scrape_sessions IS 'Individual scraping sessions with metadata';
COMMENT ON TABLE videos IS 'Scraped videos with viral score calculations';
COMMENT ON COLUMN videos.viral_score IS 'Calculated as view_count / creator_followers';
COMMENT ON COLUMN videos.platform_id IS 'Unique ID from TikTok/Instagram';
COMMENT ON COLUMN videos.scrape_session_id IS 'Links video to its scraping session';
COMMENT ON COLUMN scrape_sessions.hashtags_scraped IS 'Array of hashtag keywords included in this scrape';
