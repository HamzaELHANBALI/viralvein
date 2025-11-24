// ViralVein TypeScript Types

export interface TrackedTag {
  id: string;
  keyword: string;
  platform: 'tiktok' | 'instagram';
  last_scraped: string | null;
  status: 'active' | 'paused';
  created_at?: string;
}

export interface Video {
  id: string;
  platform_id: string;
  url: string;
  thumbnail: string;
  description: string;
  view_count: number;
  like_count: number;
  creator_followers: number;
  viral_score: number;
  upload_date: string;
  is_saved: boolean;
  notes?: string | null;
  created_at?: string;
  hashtag_keyword?: string; // Optional: track which hashtag found this
}

export interface ViralScoreCalc {
  views: number;
  followers: number;
  score: number;
  passesThreshold: boolean; // >= 1.5
}

export interface FilterCriteria {
  maxAge: number; // days
  maxFollowers: number;
  minViews: number;
  minViralScore: number;
}

export const DEFAULT_FILTERS: FilterCriteria = {
  maxAge: 30,
  maxFollowers: 500000,
  minViews: 5000,
  minViralScore: 1.5,
};

export interface ApifyVideoResult {
  id: string;
  webVideoUrl: string;
  videoMeta?: {
    coverUrl?: string;
  };
  text?: string;
  playCount?: number;
  diggCount?: number;
  authorMeta?: {
    fans?: number;
  };
  createTimeISO?: string;
}
