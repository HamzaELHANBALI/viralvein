'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Video, TrackedTag } from '@/lib/types';
import HashtagManager from '@/components/HashtagManager';
import DashboardGrid from '@/components/DashboardGrid';
import VideoModal from '@/components/VideoModal';
import StatsDashboard from '@/components/StatsDashboard';
import AlgorithmInfo from '@/components/AlgorithmInfo';
import VideoFilters, { type SortOption, type ScoreFilter } from '@/components/VideoFilters';
import { useToast } from '@/components/Toast';

export default function HomePage() {
  const [tags, setTags] = useState<TrackedTag[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isScraping, setIsScraping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('viral_score');
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>('all');
  const [savedOnly, setSavedOnly] = useState(false);
  const { showToast } = useToast();

  // Fetch tags and videos on mount
  useEffect(() => {
    fetchTags();
    fetchVideos();
  }, []);

  const fetchTags = async () => {
    try {
      const res = await fetch('/api/hashtags');
      const data = await res.json();
      if (data.success) {
        setTags(data.data);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
      showToast('Failed to fetch hashtags', 'error');
    }
  };

  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/videos?limit=100');
      const data = await res.json();
      if (data.success) {
        setVideos(data.data);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      showToast('Failed to fetch videos', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = async (keyword: string, platform: 'tiktok' | 'instagram') => {
    try {
      const res = await fetch('/api/hashtags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, platform }),
      });
      const data = await res.json();
      if (data.success) {
        setTags([...tags, data.data]);
        showToast(`Hashtag #${keyword} added successfully!`, 'success');
      } else {
        showToast(data.error || 'Failed to add hashtag', 'error');
      }
    } catch (error) {
      console.error('Error adding tag:', error);
      showToast('Failed to add hashtag', 'error');
    }
  };

  const handleDeleteTag = async (id: string) => {
    const tag = tags.find(t => t.id === id);
    try {
      const res = await fetch(`/api/hashtags?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setTags(tags.filter((t) => t.id !== id));
        showToast(`Hashtag #${tag?.keyword} deleted`, 'info');
      } else {
        showToast(data.error || 'Failed to delete hashtag', 'error');
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
      showToast('Failed to delete hashtag', 'error');
    }
  };

  const handleToggleStatus = async (id: string, status: 'active' | 'paused') => {
    try {
      const res = await fetch('/api/hashtags', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data.success) {
        setTags(tags.map((t) => (t.id === id ? { ...t, status } : t)));
        showToast(`Hashtag ${status === 'active' ? 'activated' : 'paused'}`, 'success');
      } else {
        showToast(data.error || 'Failed to update status', 'error');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      showToast('Failed to update status', 'error');
    }
  };

  const handleScrape = async () => {
    try {
      setIsScraping(true);
      showToast('Starting scrape...', 'info');
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      console.log('Scrape result:', data);

      if (data.success) {
        showToast(`Scrape completed! Found ${data.videosFound || 0} new videos`, 'success');
      } else {
        showToast(data.error || 'Scrape failed', 'error');
      }

      // Refresh videos after scraping
      await fetchVideos();
      await fetchTags(); // Update last_scraped timestamps
    } catch (error) {
      console.error('Error scraping:', error);
      showToast('Scrape failed', 'error');
    } finally {
      setIsScraping(false);
    }
  };

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
  };

  const handleSaveToggle = async (id: string, isSaved: boolean) => {
    try {
      const res = await fetch('/api/videos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_saved: isSaved }),
      });
      const data = await res.json();
      if (data.success) {
        setVideos(videos.map((v) => (v.id === id ? { ...v, is_saved: isSaved } : v)));
        if (selectedVideo?.id === id) {
          setSelectedVideo({ ...selectedVideo, is_saved: isSaved });
        }
        showToast(isSaved ? 'Video saved to swipe file' : 'Video removed from swipe file', 'success');
      } else {
        showToast(data.error || 'Failed to update video', 'error');
      }
    } catch (error) {
      console.error('Error saving video:', error);
      showToast('Failed to update video', 'error');
    }
  };

  const handleSaveWithNotes = async (id: string, notes?: string) => {
    try {
      const res = await fetch('/api/videos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_saved: true, notes }),
      });
      const data = await res.json();
      if (data.success) {
        setVideos(videos.map((v) => (v.id === id ? { ...v, is_saved: true, notes } : v)));
        if (selectedVideo?.id === id) {
          setSelectedVideo({ ...selectedVideo, is_saved: true, notes });
        }
        showToast('Video saved with notes', 'success');
      } else {
        showToast(data.error || 'Failed to save video', 'error');
      }
    } catch (error) {
      console.error('Error saving video:', error);
      showToast('Failed to save video', 'error');
    }
  };

  // Filter and sort videos
  const filteredAndSortedVideos = useMemo(() => {
    let result = [...videos];

    // Apply saved filter
    if (savedOnly) {
      result = result.filter(v => v.is_saved);
    }

    // Apply score filter
    if (scoreFilter !== 'all') {
      result = result.filter(v => {
        if (scoreFilter === 'exceptional') return v.viral_score >= 5;
        if (scoreFilter === 'strong') return v.viral_score >= 2 && v.viral_score < 5;
        if (scoreFilter === 'good') return v.viral_score >= 1.5 && v.viral_score < 2;
        return true;
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === 'viral_score') return b.viral_score - a.viral_score;
      if (sortBy === 'view_count') return b.view_count - a.view_count;
      if (sortBy === 'recent') return new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime();
      return 0;
    });

    return result;
  }, [videos, savedOnly, scoreFilter, sortBy]);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            ViralVein
          </h1>
          <p className="text-lg text-[var(--foreground-secondary)]">
            Discover viral content from smaller creators before it hits mainstream
          </p>
        </div>

        {/* Stats Dashboard */}
        <StatsDashboard videos={videos} tags={tags} />

        {/* Algorithm Info */}
        <AlgorithmInfo />

        {/* Hashtag Manager */}
        <HashtagManager
          tags={tags}
          onAdd={handleAddTag}
          onDelete={handleDeleteTag}
          onToggleStatus={handleToggleStatus}
          onScrape={handleScrape}
          isScraping={isScraping}
        />

        {/* Video Filters */}
        {videos.length > 0 && (
          <VideoFilters
            sortBy={sortBy}
            scoreFilter={scoreFilter}
            onSortChange={setSortBy}
            onScoreFilterChange={setScoreFilter}
            totalResults={filteredAndSortedVideos.length}
            savedOnly={savedOnly}
            onSavedOnlyChange={setSavedOnly}
          />
        )}

        {/* Videos Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="glass-card overflow-hidden">
                <div className="aspect-[9/16] skeleton" />
                <div className="p-4 space-y-3">
                  <div className="h-4 skeleton w-3/4" />
                  <div className="h-3 skeleton w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <DashboardGrid
            videos={filteredAndSortedVideos}
            onVideoClick={handleVideoClick}
            onSaveToggle={handleSaveToggle}
          />
        )}

        {/* Video Modal */}
        <VideoModal
          video={selectedVideo}
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
          onSave={handleSaveWithNotes}
        />
      </div>
    </div>
  );
}
